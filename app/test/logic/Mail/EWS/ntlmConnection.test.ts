// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { NTLMConnection } from "../../../../logic/Auth/NTLM/NTLMConnection";
import { NTLMConnectionPool } from "../../../../logic/Auth/NTLM/NTLMConnectionPool";
import type { NTLMServer } from "../../../../logic/Auth/NTLM/NTLMTransport";
import { LoginError } from "../../../../logic/Abstract/Account";
import { NTLMTestServer, sleep } from "./ntlmTestServer";
// The node.js backend parts, in-process instead of via JPC
import { HTTPConnection } from "../../../../../desktop/backend/HTTPConnection";
// @ts-ignore .js without types
import { createType1Message, decodeType2Message, createType3Message } from "../../../../../desktop/backend/ntlm";
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
      webSessionID: "test-account",
      useOwnNTLM: true,
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
    let pool = new NTLMConnectionPool(account);
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
    let pool = new NTLMConnectionPool(account);
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
    let pool = new NTLMConnectionPool(account);
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
    let pool = new NTLMConnectionPool(account);
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
    let pool = new NTLMConnectionPool(account);
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
    let pool = new NTLMConnectionPool(account);
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
    let pool = new NTLMConnectionPool(account);
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
    let pool = new NTLMConnectionPool(account);
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
