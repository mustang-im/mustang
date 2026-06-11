/**
 * Minimal XMPP server speaking the real wire protocol over WebSocket
 * (RFC 7395 framing), for testing our client against:
 * SASL PLAIN auth, resource binding, roster, MAM (XEP-0313) with
 * RSM paging (XEP-0059), carbons, and live message delivery.
 */
import { parse, XMLElement } from "stanza/jxt";
import { WebSocketServer, WebSocket } from "ws";

export interface ArchivedMessage {
  /** MAM archive ID */
  archiveID: string;
  from: string;
  to: string;
  body: string;
  /** ISO 8601 */
  time: string;
}

export class MockXMPPServer {
  domain = "localhost";
  users = new Map<string, string>(); // user -> password
  roster: { jid: string, name: string }[] = [];
  /** bare peer JID -> archived messages with that peer, in chronological order */
  archives = new Map<string, ArchivedMessage[]>();
  /** Messages that clients sent to the server */
  received: { to: string, body: string }[] = [];
  /** How many MAM queries used an RSM `after` (= incremental sync) */
  countQueriesAfter = 0;
  countQueriesTotal = 0;

  protected wss: WebSocketServer;
  protected sockets = new Set<WebSocket>();
  port: number;

  async start(): Promise<number> {
    this.wss = new WebSocketServer({ port: 0, handleProtocols: () => "xmpp" });
    this.wss.on("connection", ws => {
      this.sockets.add(ws);
      let session = new Session(this, ws);
      ws.on("message", data => session.onStanza(data.toString()));
      ws.on("close", () => this.sockets.delete(ws));
    });
    await new Promise<void>(resolve => this.wss.on("listening", resolve));
    this.port = (this.wss.address() as any).port;
    return this.port;
  }

  async stop(): Promise<void> {
    for (let ws of this.sockets) {
      ws.close();
    }
    await new Promise<void>(resolve => this.wss.close(() => resolve()));
  }

  get url(): string {
    return `ws://127.0.0.1:${this.port}`;
  }

  addToArchive(peer: string, msg: ArchivedMessage): void {
    let archive = this.archives.get(peer);
    if (!archive) {
      this.archives.set(peer, archive = []);
    }
    archive.push(msg);
  }

  /** Delivers a live message to all connected (logged-in) clients */
  pushMessage(from: string, to: string, body: string): void {
    for (let ws of this.sockets) {
      ws.send(`<message xmlns="jabber:client" from="${from}/mock" to="${to}" type="chat" id="live-${Date.now()}"><body>${body}</body></message>`);
    }
  }
}

class Session {
  server: MockXMPPServer;
  ws: WebSocket;
  authenticated = false;
  jid: string;

  constructor(server: MockXMPPServer, ws: WebSocket) {
    this.server = server;
    this.ws = ws;
  }

  send(xml: string): void {
    this.ws.send(xml);
  }

  onStanza(xml: string): void {
    let stanza: XMLElement;
    try {
      stanza = parse(xml);
    } catch (ex) {
      console.error("Mock server failed to parse", xml);
      return;
    }
    let name = stanza.name;
    if (name == "open") {
      this.send(`<open xmlns="urn:ietf:params:xml:ns:xmpp-framing" from="${this.server.domain}" id="mock-${Date.now()}" version="1.0" xml:lang="en"/>`);
      if (this.authenticated) {
        this.send(`<stream:features xmlns:stream="http://etherx.jabber.org/streams"><bind xmlns="urn:ietf:params:xml:ns:xmpp-bind"/></stream:features>`);
      } else {
        this.send(`<stream:features xmlns:stream="http://etherx.jabber.org/streams"><mechanisms xmlns="urn:ietf:params:xml:ns:xmpp-sasl"><mechanism>PLAIN</mechanism></mechanisms></stream:features>`);
      }
    } else if (name == "auth") {
      this.onAuth(stanza);
    } else if (name == "iq") {
      this.onIQ(stanza);
    } else if (name == "message") {
      let body = stanza.getChild("body")?.getText();
      if (body) {
        this.server.received.push({ to: stanza.getAttribute("to"), body });
      }
    } else if (name == "close") {
      this.send(`<close xmlns="urn:ietf:params:xml:ns:xmpp-framing"/>`);
    }
    // ignore presence etc.
  }

  onAuth(stanza: XMLElement): void {
    let decoded = Buffer.from(stanza.getText(), "base64").toString("utf8");
    let [, username, password] = decoded.split("\0");
    if (this.server.users.get(username) === password) {
      this.authenticated = true;
      this.jid = `${username}@${this.server.domain}`;
      this.send(`<success xmlns="urn:ietf:params:xml:ns:xmpp-sasl"/>`);
    } else {
      this.send(`<failure xmlns="urn:ietf:params:xml:ns:xmpp-sasl"><not-authorized/></failure>`);
    }
  }

  onIQ(stanza: XMLElement): void {
    let id = stanza.getAttribute("id");
    let type = stanza.getAttribute("type");
    let bind = stanza.getChild("bind", "urn:ietf:params:xml:ns:xmpp-bind");
    let rosterQuery = stanza.getChild("query", "jabber:iq:roster");
    let mamQuery = stanza.getChild("query", "urn:xmpp:mam:2") ?? stanza.getChild("query", "urn:xmpp:mam:1");
    let vcard = stanza.getChild("vCard", "vcard-temp");
    if (bind && type == "set") {
      this.send(`<iq xmlns="jabber:client" type="result" id="${id}"><bind xmlns="urn:ietf:params:xml:ns:xmpp-bind"><jid>${this.jid}/mockresource</jid></bind></iq>`);
    } else if (rosterQuery && type == "get") {
      let items = this.server.roster
        .map(item => `<item jid="${item.jid}" name="${item.name}" subscription="both"/>`)
        .join("");
      this.send(`<iq xmlns="jabber:client" type="result" id="${id}" to="${this.jid}"><query xmlns="jabber:iq:roster">${items}</query></iq>`);
    } else if (mamQuery && type == "set") {
      this.onMAMQuery(stanza, mamQuery, id);
    } else if (vcard && type == "get") {
      // no vCard set for this user; client must tolerate this
      this.send(`<iq xmlns="jabber:client" type="error" id="${id}" from="${stanza.getAttribute("to")}"><error type="cancel"><item-not-found xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/></error></iq>`);
    } else {
      // ping, carbons enable, etc.
      this.send(`<iq xmlns="jabber:client" type="result" id="${id}"/>`);
    }
  }

  /** MAM query with RSM: empty <before/> = last page, <after>ID</after> = newer than ID */
  onMAMQuery(iq: XMLElement, query: XMLElement, id: string): void {
    this.server.countQueriesTotal++;
    let ns = query.getAttribute("xmlns") ?? "urn:xmpp:mam:2";
    let queryID = query.getAttribute("queryid");
    let withJID: string | undefined;
    let form = query.getChild("x", "jabber:x:data");
    for (let field of form?.getChildren("field") ?? []) {
      if (field.getAttribute("var") == "with") {
        withJID = field.getChild("value")?.getText();
      }
    }
    let rsm = query.getChild("set", "http://jabber.org/protocol/rsm");
    let max = parseInt(rsm?.getChild("max")?.getText() ?? "50");
    let before = rsm?.getChild("before");
    let after = rsm?.getChild("after")?.getText();

    let all = this.server.archives.get(withJID) ?? [];
    let page: ArchivedMessage[];
    if (after) {
      this.server.countQueriesAfter++;
      let index = all.findIndex(msg => msg.archiveID == after);
      if (index < 0) {
        this.send(`<iq xmlns="jabber:client" type="error" id="${id}"><error type="cancel"><item-not-found xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/></error></iq>`);
        return;
      }
      page = all.slice(index + 1, index + 1 + max);
    } else if (before) { // empty <before/>: last page
      page = all.slice(Math.max(0, all.length - max));
    } else {
      page = all.slice(0, max);
    }
    for (let msg of page) {
      this.send(`<message xmlns="jabber:client" to="${this.jid}/mockresource">` +
        `<result xmlns="${ns}" queryid="${queryID}" id="${msg.archiveID}">` +
        `<forwarded xmlns="urn:xmpp:forward:0">` +
        `<delay xmlns="urn:xmpp:delay" stamp="${msg.time}"/>` +
        `<message xmlns="jabber:client" from="${msg.from}" to="${msg.to}" type="chat" id="msg-${msg.archiveID}"><body>${msg.body}</body></message>` +
        `</forwarded></result></message>`);
    }
    let complete = !page.length || page[page.length - 1] == all[all.length - 1];
    let first = page[0]?.archiveID;
    let last = page[page.length - 1]?.archiveID;
    let rsmResult = page.length
      ? `<set xmlns="http://jabber.org/protocol/rsm"><first index="0">${first}</first><last>${last}</last><count>${all.length}</count></set>`
      : `<set xmlns="http://jabber.org/protocol/rsm"><count>${all.length}</count></set>`;
    this.send(`<iq xmlns="jabber:client" type="result" id="${id}" to="${this.jid}/mockresource">` +
      `<fin xmlns="${ns}" complete="${complete}">${rsmResult}</fin></iq>`);
  }
}
