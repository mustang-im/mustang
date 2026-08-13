// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { NTLMConnection, type NTLMServer } from "../../../../logic/Auth/NTLM/NTLMConnection";
import { NTLMConnectionPool } from "../../../../logic/Auth/NTLM/NTLMConnectionPool";
import { LoginError } from "../../../../logic/Abstract/Account";
// The node.js backend parts, in-process instead of via JPC
import { HTTPConnection } from "../../../../../desktop/backend/HTTPConnection";
// @ts-ignore .js without types
import { createType1Message, decodeType2Message, createType3Message } from "../../../../../desktop/backend/ntlm";
// @ts-ignore Same MD4 that ntlm.js uses. node.js `crypto` dropped MD4.
import { create as createMD4 } from "../../../../../desktop/backend/node_modules/js-md4/src/md4.js";
import http from "node:http";
import type { Socket } from "node:net";
import type { AddressInfo } from "node:net";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import zlib from "node:zlib";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("NTLM per-TCP-connection authentication", () => {
  let server: NTLMTestServer;
  let account: NTLMServer;

  beforeEach(async () => {
    server = new NTLMTestServer();
    await server.start();
    account = {
      url: server.url,
      username: "testuser",
      password: server.password,
      acceptBrokenTLSCerts: false,
    };
    appGlobal.remoteApp = {
      newHTTPConnection: async (url: string, options: any) => jpcLike(new HTTPConnection(url, options)),
      createType1Message: async () => createType1Message(),
      createType3MessageFromType2Message: async (wwwAuthenticate: string, username: string, password: string) =>
        createType3Message(decodeType2Message(wwwAuthenticate), username, password),
    };
  });

  afterEach(async () => {
    await server.stop();
  });

  it("authenticates once per TCP connection, with minimal round trips", async () => {
    let conn = new NTLMConnection(account);
    let response = await conn.request("<request>1</request>");
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("<response><request>1</request></response>");
    // 1 extra round trip for the handshake: Type 1 probe, then Type 3 + request
    expect(server.requests).toBe(2);
    expect(server.socketsCreated).toBe(1);
    expect(server.handshakesCompleted).toBe(1);

    // Later requests reuse the authenticated connection: no extra round trips,
    // no `Authorization` header at all
    response = await conn.request("<request>2</request>");
    expect(await response.text()).toBe("<response><request>2</request></response>");
    expect(server.requests).toBe(3);
    expect(server.socketsCreated).toBe(1);
    expect(server.handshakesCompleted).toBe(1);
    expect(server.authWhileAuthenticated).toBe(0);
    conn.close();
  });

  it("decompresses gzip responses", async () => {
    server.gzipResponses = true;
    let conn = new NTLMConnection(account);
    let response = await conn.request("<request>gz</request>");
    expect(await response.text()).toBe("<response><request>gz</request></response>");
    conn.close();
  });

  it("runs a parallel request storm correctly", async () => {
    let pool = new NTLMConnectionPool(account, 6);
    let requests = [];
    for (let i = 0; i < 40; i++) {
      requests.push(pool.request(`<request>${i}</request>`).then(async response => {
        // Each response must belong to its request: no cross-connection mixups
        expect(await response.text()).toBe(`<response><request>${i}</request></response>`);
        expect(response.status).toBe(200);
      }));
    }
    await Promise.all(requests);
    expect(server.socketsCreated).toBeLessThanOrEqual(6);
    // Each TCP connection was authenticated exactly once
    expect(server.handshakesCompleted).toBe(server.socketsCreated);
    // No request ever hit the server on a connection that wasn't authenticated
    expect(server.rejectedRequests).toBe(0);
    expect(server.authWhileAuthenticated).toBe(0);
    pool.closeAll();
  });

  it("re-authenticates when the server closes connections between requests", async () => {
    server.closeAfterResponses = 2; // each connection dies right after the handshake + first request
    let pool = new NTLMConnectionPool(account, 6);
    for (let i = 0; i < 10; i++) {
      let response = await pool.request(`<request>${i}</request>`);
      expect(await response.text()).toBe(`<response><request>${i}</request></response>`);
      await sleep(20); // let the FIN arrive, so the client knows the connection is dead
    }
    expect(server.handshakesCompleted).toBe(10); // one per connection
    expect(server.rejectedRequests).toBe(0); // client saw each dead connection and re-authenticated pro-actively
    pool.closeAll();
  });

  it("recovers from the keep-alive race: connection killed while the request is on the wire", async () => {
    let pool = new NTLMConnectionPool(account, 6);
    let response = await pool.request("<request>1</request>");
    expect(response.status).toBe(200);
    server.killNextRequest = true; // server destroys the TCP connection upon receiving the next request
    response = await pool.request("<request>2</request>");
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("<response><request>2</request></response>");
    expect(server.handshakesCompleted).toBe(2); // re-authenticated the replacement connection
    pool.closeAll();
  });

  it("re-authenticates when the server drops the auth state, e.g. a load balancer", async () => {
    let pool = new NTLMConnectionPool(account, 6);
    let response = await pool.request("<request>1</request>");
    expect(response.status).toBe(200);
    server.dropAuthState();
    response = await pool.request("<request>2</request>");
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("<response><request>2</request></response>");
    expect(server.handshakesCompleted).toBe(2);
    expect(server.rejectedRequests).toBe(1); // the one that discovered the dropped state
    pool.closeAll();
  });

  it("rejects a wrong password with LoginError, without endless retries", async () => {
    account.password = "wrong password";
    let pool = new NTLMConnectionPool(account, 6);
    let ex: Error | null = null;
    try {
      await pool.request("<request>1</request>");
    } catch (e) {
      ex = e;
    }
    expect(ex).toBeInstanceOf(LoginError);
    expect(server.requests).toBeLessThanOrEqual(8); // a few handshake attempts, but no endless loop
    pool.closeAll();
  });

  it("errors when the server offers only Basic authentication", async () => {
    server.authScheme = "Basic";
    let conn = new NTLMConnection(account);
    await expect(conn.request("<request>1</request>")).rejects.toThrowError(/does not support/);
    conn.close();
  });

  it("works when the server does not require authentication", async () => {
    server.requireAuth = false;
    let conn = new NTLMConnection(account);
    let response = await conn.request("<request>1</request>");
    expect(await response.text()).toBe("<response><request>1</request></response>");
    conn.close();
  });

  it("streams a chunked response after authenticating", async () => {
    server.streamChunks = ["<Envelope>1</Envelope>", "<Envelope>2</Envelope>", "<Envelope>3</Envelope>"];
    let pool = new NTLMConnectionPool(account, 6);
    let conn = pool.newDedicatedConnection();
    let received: string[] = [];
    let response = await conn.request("<request>stream</request>", {
      onChunk: async chunk => {
        received.push(chunk);
      },
    });
    expect(response.ok).toBe(true);
    expect(received.join("")).toBe(server.streamChunks.join(""));
    expect(received.length).toBeGreaterThan(1); // actually streamed, not buffered
    expect(server.handshakesCompleted).toBe(1);
    conn.close();
  });

  it("aborting a stream closes the connection", async () => {
    server.streamChunks = ["<Envelope>1</Envelope>"];
    server.keepStreamOpen = true;
    let pool = new NTLMConnectionPool(account, 6);
    let conn = pool.newDedicatedConnection();
    let abort = new AbortController();
    let received: string[] = [];
    let promise = conn.request("<request>stream</request>", {
      signal: abort.signal,
      onChunk: async chunk => {
        received.push(chunk);
      },
    });
    while (!received.length) {
      await sleep(10);
    }
    abort.abort("test ended");
    await expect(promise).rejects.toThrow();
    conn.close();
  });

  it("keeps cookies per account, like load balancer affinity cookies", async () => {
    server.setCookie = "X-BackEndCookie=abc123";
    let pool = new NTLMConnectionPool(account, 6);
    await pool.request("<request>1</request>");
    await pool.request("<request>2</request>");
    // The cookie was set on the handshake response, and all later requests
    // carry it, even the handshake of a different connection of this account
    let conn = pool.newDedicatedConnection();
    await conn.request("<request>3</request>");
    conn.close();
    let requestsAfterCookieWasSet = server.cookieLog.slice(2);
    expect(requestsAfterCookieWasSet.length).toBeGreaterThanOrEqual(3);
    for (let cookie of requestsAfterCookieWasSet) {
      expect(cookie).toBe("X-BackEndCookie=abc123");
    }
    pool.closeAll();
  });
});

/** Makes the direct backend object look like it came over JPC:
 * All methods return promises. */
function jpcLike(conn: HTTPConnection) {
  return {
    request: async (options: any, onChunk?: (chunk: string) => Promise<void>) => conn.request(options, onChunk),
    isAlive: async () => conn.isAlive(),
    close: async () => conn.close(),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface SocketState {
  authenticated: boolean;
  challenge: Buffer | null;
  responses: number;
}

/**
 * A mock Exchange server which strictly enforces that NTLM authenticates
 * the TCP connection: The Type 2 challenge is bound to the connection that
 * requested it, the Type 3 login is verified with real NTLMv2 crypto, and
 * a login is only ever valid for the TCP connection it happened on.
 */
class NTLMTestServer {
  readonly password = "P@ssw0rd of tésts";
  readonly domain = "TESTDOM";
  protected server: http.Server;
  url: string;
  protected states = new Map<Socket, SocketState>();

  // Statistics
  socketsCreated = 0;
  requests = 0;
  handshakesCompleted = 0;
  /** Requests with a body that arrived on an unauthenticated connection */
  rejectedRequests = 0;
  /** Requests with an `Authorization` header on an already authenticated
   * connection = wasted handshakes */
  authWhileAuthenticated = 0;
  /** `Cookie` header of each request, in order */
  cookieLog: string[] = [];

  // Behavior
  requireAuth = true;
  authScheme = "NTLM";
  gzipResponses = false;
  /** Close the TCP connection after this many responses on it. 0 = never */
  closeAfterResponses = 0;
  /** Destroy the TCP connection as soon as the next request arrives on it */
  killNextRequest = false;
  /** Send the response in these chunks, with pauses in between */
  streamChunks: string[] | null = null;
  /** After `streamChunks`, keep the response open, like a notification stream */
  keepStreamOpen = false;
  setCookie: string | null = null;

  async start(): Promise<void> {
    this.server = http.createServer((req, res) => {
      this.onRequest(req, res).catch(ex => {
        console.error(ex);
        res.destroy();
      });
    });
    this.server.on("connection", socket => {
      this.socketsCreated++;
      this.states.set(socket, { authenticated: false, challenge: null, responses: 0 });
      socket.on("data", () => {
        if (this.killNextRequest) {
          this.killNextRequest = false;
          socket.destroy();
        }
      });
      socket.on("close", () => this.states.delete(socket));
    });
    await new Promise<void>(resolve => this.server.listen(0, "127.0.0.1", resolve));
    this.url = `http://127.0.0.1:${(this.server.address() as AddressInfo).port}/EWS/Exchange.asmx`;
  }

  async stop(): Promise<void> {
    for (let socket of this.states.keys()) {
      socket.destroy();
    }
    await new Promise<void>(resolve => this.server.close(() => resolve()));
  }

  /** Simulates a load balancer moving us to a backend server that has not
   * seen our login: All connections lose their authentication. */
  dropAuthState(): void {
    for (let state of this.states.values()) {
      state.authenticated = false;
      state.challenge = null;
    }
  }

  protected async onRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    this.requests++;
    this.cookieLog.push(req.headers.cookie ?? "");
    let body = "";
    for await (let chunk of req) {
      body += chunk;
    }
    let state = this.states.get(req.socket);
    if (!state) {
      res.destroy();
      return;
    }
    if (!this.requireAuth || state.authenticated) {
      if (req.headers.authorization) {
        this.authWhileAuthenticated++;
      }
      this.respondOK(res, state, body);
      return;
    }
    let auth = req.headers.authorization;
    if (this.authScheme == "NTLM" && auth?.startsWith("NTLM ")) {
      let msg = Buffer.from(auth.slice(5), "base64");
      let type = msg.length > 12 ? msg.readUInt32LE(8) : 0;
      if (type == 1) {
        state.challenge = randomBytes(8);
        this.respond401(res, state, this.buildType2(state.challenge));
        return;
      }
      if (type == 3 && state.challenge &&
          verifyType3NTLMv2(msg, state.challenge, this.password)) {
        // The challenge is bound to this TCP connection, and used once
        state.challenge = null;
        state.authenticated = true;
        this.handshakesCompleted++;
        this.respondOK(res, state, body);
        return;
      }
      // Type 3 for a challenge of another connection, or wrong password
      state.challenge = null;
      this.respond401(res, state, this.authScheme);
      return;
    }
    if (body) {
      this.rejectedRequests++;
    }
    this.respond401(res, state, this.authScheme);
  }

  protected respondOK(res: http.ServerResponse, state: SocketState, requestBody: string): void {
    if (this.streamChunks) {
      res.writeHead(200, { "Content-Type": "text/xml" });
      this.streamResponse(res).catch(console.error);
      return;
    }
    let body: Buffer | string = `<response>${requestBody}</response>`;
    let headers: Record<string, string> = { "Content-Type": "text/xml" };
    if (this.gzipResponses) {
      body = zlib.gzipSync(Buffer.from(body));
      headers["Content-Encoding"] = "gzip";
    }
    res.writeHead(200, headers);
    this.finishResponse(res, state);
    res.end(body);
  }

  protected async streamResponse(res: http.ServerResponse): Promise<void> {
    for (let chunk of this.streamChunks) {
      res.write(chunk);
      await sleep(30);
    }
    if (!this.keepStreamOpen) {
      res.end();
    }
  }

  protected respond401(res: http.ServerResponse, state: SocketState, wwwAuthenticate: string): void {
    let headers: Record<string, string> = {
      "WWW-Authenticate": wwwAuthenticate,
      "Content-Type": "text/html",
    };
    if (this.setCookie) {
      headers["Set-Cookie"] = this.setCookie + "; path=/; HttpOnly";
    }
    res.writeHead(401, headers);
    this.finishResponse(res, state);
    res.end("<html>401 Unauthorized</html>");
  }

  /** Call before `res.end()`, while `res.socket` is still attached */
  protected finishResponse(res: http.ServerResponse, state: SocketState): void {
    state.responses++;
    if (this.closeAfterResponses && state.responses >= this.closeAfterResponses) {
      let socket = res.socket;
      res.on("finish", () => socket?.end()); // FIN after the response bytes are out
    }
  }

  /** NTLM Type 2 message with the given server challenge,
   * negotiating unicode, extended security and target info,
   * so that the client answers with NTLMv2. */
  protected buildType2(challenge: Buffer): string {
    let targetName = Buffer.from(this.domain, "utf16le");
    let targetInfo = Buffer.concat([
      avPair(2, Buffer.from(this.domain, "utf16le")), // MsvAvNbDomainName
      avPair(1, Buffer.from("TESTSRV", "utf16le")), // MsvAvNbComputerName
      avPair(0, Buffer.alloc(0)), // MsvAvEOL
    ]);
    const kHeaderLength = 48;
    let buf = Buffer.alloc(kHeaderLength + targetName.length + targetInfo.length);
    buf.write("NTLMSSP\0", 0, 8, "ascii");
    buf.writeUInt32LE(2, 8); // Type 2
    buf.writeUInt16LE(targetName.length, 12);
    buf.writeUInt16LE(targetName.length, 14);
    buf.writeUInt32LE(kHeaderLength, 16);
    const kFlags = 0x1 | // NegotiateUnicode
      0x4 | // RequestTarget
      0x200 | // NegotiateNTLM
      0x8000 | // NegotiateAlwaysSign
      0x10000 | // TargetTypeDomain
      0x80000 | // NegotiateExtendedSecurity
      0x800000; // NegotiateTargetInfo
    buf.writeUInt32LE(kFlags, 20);
    challenge.copy(buf, 24);
    // 32-39: reserved, zero
    buf.writeUInt16LE(targetInfo.length, 40);
    buf.writeUInt16LE(targetInfo.length, 42);
    buf.writeUInt32LE(kHeaderLength + targetName.length, 44);
    targetName.copy(buf, kHeaderLength);
    targetInfo.copy(buf, kHeaderLength + targetName.length);
    return "NTLM " + buf.toString("base64");
  }
}

function avPair(id: number, value: Buffer): Buffer {
  let header = Buffer.alloc(4);
  header.writeUInt16LE(id, 0);
  header.writeUInt16LE(value.length, 2);
  return Buffer.concat([header, value]);
}

/**
 * Verifies the client's NTLMv2 proof against the server challenge and the
 * known password, like a real server. @see MS-NLMP section 3.3.2
 */
function verifyType3NTLMv2(msg: Buffer, serverChallenge: Buffer, password: string): boolean {
  if (msg.slice(0, 8).toString("ascii") != "NTLMSSP\0" || msg.readUInt32LE(8) != 3) {
    return false;
  }
  let ntLen = msg.readUInt16LE(20);
  let ntOffset = msg.readUInt32LE(24);
  let domainLen = msg.readUInt16LE(28);
  let domainOffset = msg.readUInt32LE(32);
  let userLen = msg.readUInt16LE(36);
  let userOffset = msg.readUInt32LE(40);
  let flags = msg.readUInt32LE(60);
  let encoding: BufferEncoding = flags & 0x1 ? "utf16le" : "ascii";
  let username = msg.slice(userOffset, userOffset + userLen).toString(encoding);
  let domain = msg.slice(domainOffset, domainOffset + domainLen).toString(encoding);
  let ntResponse = msg.slice(ntOffset, ntOffset + ntLen);
  if (ntResponse.length < 48) {
    return false; // Not NTLMv2
  }
  let proof = ntResponse.slice(0, 16);
  let blob = ntResponse.slice(16);
  // NTOWFv2 = HMAC-MD5(MD4(UTF16LE(password)), UTF16LE(UPPER(user) + domain))
  let pwdHash = Buffer.from(createMD4().update(Buffer.from(password, "utf16le")).digest());
  let ntowfV2 = hmacMD5(pwdHash, Buffer.from(username.toUpperCase() + domain, "utf16le"));
  let expectedProof = hmacMD5(ntowfV2, Buffer.concat([serverChallenge, blob]));
  return timingSafeEqual(proof, expectedProof);
}

function hmacMD5(key: Buffer, data: Buffer): Buffer {
  return createHmac("md5", key).update(data).digest();
}
