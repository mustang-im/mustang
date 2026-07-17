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
  /** The message's own ID. Servers preserve it in the archive. */
  id?: string;
  from: string;
  to: string;
  body: string;
  /** ISO 8601 */
  time: string;
}

export interface MockGroup {
  /** e.g. room@conference.localhost */
  jid: string;
  name: string;
  /** Our user's nickname, in the bookmark */
  nick?: string;
  /** The other people in the room. jid = real JID, for non-anonymous rooms */
  occupants: { nick: string, jid?: string }[];
}

export class MockXMPPServer {
  domain = "localhost";
  users = new Map<string, string>(); // user -> password
  roster: { jid: string, name: string }[] = [];
  /** Group chat rooms, exposed to clients as bookmarks */
  groups: MockGroup[] = [];
  /** bare peer JID (or room JID) -> archived messages, in chronological order */
  archives = new Map<string, ArchivedMessage[]>();
  protected archiveCounter = 1000;
  /** Messages that clients sent to the server */
  received: { to: string, body: string }[] = [];
  /** How many MAM queries used an RSM `after` (= incremental sync) */
  countQueriesAfter = 0;
  countQueriesTotal = 0;
  /** All MAM queries that clients made */
  queries: { withJID: string, after?: string, before?: boolean, max: number }[] = [];

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

  /** Delivers a live group chat message from a room member */
  pushGroupMessage(roomJID: string, nick: string, body: string): void {
    let id = `live-${Date.now()}`;
    this.addToArchive(roomJID, { archiveID: `r${++this.archiveCounter}`, id, from: `${roomJID}/${nick}`, to: roomJID, body, time: new Date().toISOString() });
    for (let ws of this.sockets) {
      ws.send(`<message xmlns="jabber:client" from="${roomJID}/${nick}" type="groupchat" id="${id}"><body>${body}</body></message>`);
    }
  }

  /** Archives a message that a client sent to a room, and reflects it back,
   * like a MUC service does */
  reflectGroupMessage(session: Session, roomJID: string, id: string, body: string): void {
    let nick = session.joinedRooms.get(roomJID) ?? "unknown";
    this.addToArchive(roomJID, { archiveID: `r${++this.archiveCounter}`, id, from: `${roomJID}/${nick}`, to: roomJID, body, time: new Date().toISOString() });
    session.send(`<message xmlns="jabber:client" from="${roomJID}/${nick}" type="groupchat" id="${id}"><body>${body}</body></message>`);
  }
}

export class Session {
  server: MockXMPPServer;
  ws: WebSocket;
  authenticated = false;
  jid: string;
  /** room JID -> nick that this session joined with */
  joinedRooms = new Map<string, string>();

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
      let to = stanza.getAttribute("to");
      if (body) {
        this.server.received.push({ to, body });
      }
      if (body && stanza.getAttribute("type") == "groupchat") {
        this.server.reflectGroupMessage(this, to?.split("/")[0], stanza.getAttribute("id"), body);
      }
    } else if (name == "presence") {
      this.onPresence(stanza);
    } else if (name == "close") {
      this.send(`<close xmlns="urn:ietf:params:xml:ns:xmpp-framing"/>`);
    }
  }

  /** Directed presence to a room = joining or leaving it (XEP-0045) */
  onPresence(stanza: XMLElement): void {
    let to = stanza.getAttribute("to");
    if (!to?.includes("/")) {
      return; // normal presence broadcast
    }
    let roomJID = to.split("/")[0];
    let nick = to.substring(to.indexOf("/") + 1);
    let room = this.server.groups.find(g => g.jid == roomJID);
    if (!room) {
      return;
    }
    if (stanza.getAttribute("type") == "unavailable") {
      this.joinedRooms.delete(roomJID);
      this.send(`<presence xmlns="jabber:client" from="${roomJID}/${nick}" to="${this.jid}/mockresource" type="unavailable"><x xmlns="http://jabber.org/protocol/muc#user"><item affiliation="member" role="none"/><status code="110"/></x></presence>`);
      return;
    }
    this.joinedRooms.set(roomJID, nick);
    // The other occupants first, then ourselves with status 110
    for (let occupant of room.occupants) {
      this.send(`<presence xmlns="jabber:client" from="${roomJID}/${occupant.nick}" to="${this.jid}/mockresource"><x xmlns="http://jabber.org/protocol/muc#user"><item affiliation="member" role="participant"${occupant.jid ? ` jid="${occupant.jid}/mock"` : ""}/></x></presence>`);
    }
    this.send(`<presence xmlns="jabber:client" from="${roomJID}/${nick}" to="${this.jid}/mockresource"><x xmlns="http://jabber.org/protocol/muc#user"><item affiliation="member" role="participant"/><status code="110"/></x></presence>`);
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
    let privateStorage = stanza.getChild("query", "jabber:iq:private");
    if (privateStorage && type == "get") {
      let bookmarks = privateStorage.getChild("storage", "storage:bookmarks")
        ? this.server.groups
          .map(g => `<conference jid="${g.jid}" name="${g.name}" autojoin="true">${g.nick ? `<nick>${g.nick}</nick>` : ""}</conference>`)
          .join("")
        : "";
      this.send(`<iq xmlns="jabber:client" type="result" id="${id}" to="${this.jid}/mockresource"><query xmlns="jabber:iq:private"><storage xmlns="storage:bookmarks">${bookmarks}</storage></query></iq>`);
    } else if (bind && type == "set") {
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
    // A query addressed to a room asks the room's own archive (MUC MAM)
    let archiveJID = withJID ?? iq.getAttribute("to")?.split("/")[0];
    this.server.queries.push({ withJID: archiveJID, after, before: !!before, max });

    let all = this.server.archives.get(archiveJID) ?? [];
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
        `<message xmlns="jabber:client" from="${msg.from}" to="${msg.to}" type="chat" id="${msg.id ?? `msg-${msg.archiveID}`}"><body>${msg.body}</body></message>` +
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
