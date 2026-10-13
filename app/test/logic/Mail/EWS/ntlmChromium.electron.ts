/**
 * Tests `NetSession` — the NTLM login through Chromium's network stack —
 * against the same strict mock server as our own NTLM implementation.
 *
 * Runs under Electron (`Net.request` needs it), started by
 * `ntlmChromium.test.ts`, which bundles this file with esbuild.
 * Exit code 0 = all checks passed.
 */
import { app } from "electron";
import { NetSession } from "../../../../../desktop/backend/NetSession";
import { isNetworkError } from "../../../../logic/util/netUtil";
import { NTLMTestServer, sleep } from "./ntlmTestServer";

const kUser = "testuser";
let checks = 0;
let failures = 0;

function expectEq(actual: any, expected: any, label: string) {
  checks++;
  if (actual !== expected) {
    failures++;
    console.error(`FAIL: ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function expectAtMost(actual: number, max: number, label: string) {
  checks++;
  if (!(actual <= max)) {
    failures++;
    console.error(`FAIL: ${label}: expected at most ${max}, got ${actual}`);
  }
}

let partitionCounter = 0;
async function withServer(label: string, fn: (server: NTLMTestServer, net: NetSession) => Promise<void>) {
  let server = new NTLMTestServer();
  await server.start();
  try {
    await fn(server, new NetSession(server.url, `ntlm-test-${++partitionCounter}`, kUser, server.password));
  } catch (ex) {
    failures++;
    console.error(`FAIL: ${label}:`, ex);
  } finally {
    await server.stop();
  }
  console.log(`done: ${label}`);
}

function options(body: string) {
  return {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=utf-8" },
    body,
  };
}

async function testBasicAndReuse() {
  await withServer("authenticates the TCP connections, then reuses them", async (server, net) => {
    let response = await net.request(options("<request>1</request>"));
    expectEq(response.status, 200, "status");
    expectEq(response.body, "<response><request>1</request></response>", "body");
    expectEq(server.handshakesCompleted, 1, "one handshake");
    let requestsBefore = server.requests;
    response = await net.request(options("<request>2</request>"));
    expectEq(response.body, "<response><request>2</request></response>", "reuse body");
    expectEq(server.handshakesCompleted, 1, "no re-handshake on the authenticated connection");
    expectEq(server.requests - requestsBefore, 1, "no extra round trips on the authenticated connection");
    expectEq(server.authWhileAuthenticated, 0, "no Authorization header re-sent");
  });
}

async function testParallelStorm() {
  await withServer("runs a parallel request storm correctly", async (server, net) => {
    let requests = [];
    for (let i = 0; i < 40; i++) {
      requests.push(net.request(options(`<request>${i}</request>`))
        .then(response => {
          // Each response must belong to its request: no cross-connection mixups
          expectEq(response.status, 200, `storm ${i} status`);
          expectEq(response.body, `<response><request>${i}</request></response>`, `storm ${i} body`);
        }));
    }
    await Promise.all(requests);
    expectAtMost(server.socketsCreated, 6, "Chromium pools 6 connections");
    expectEq(server.handshakesCompleted, server.socketsCreated, "each TCP connection authenticated exactly once");
    // Chromium sends the first request of a connection without auth,
    // gets the 401 challenge, then logs in on that same connection
    expectAtMost(server.rejectedRequests, server.socketsCreated, "at most one 401 per connection");
    expectEq(server.authWhileAuthenticated, 0, "no wasted handshakes");
  });
}

async function testServerClosesConnections() {
  await withServer("re-authenticates when the server closes connections", async (server, net) => {
    server.closeAfterResponses = 2;
    for (let i = 0; i < 8; i++) {
      let response = await net.request(options(`<request>${i}</request>`));
      if (response.status == 401) {
        /* The connection died in the middle of the login handshake, and
         * Chromium surfaces the 401 instead of restarting the handshake on a
         * new connection. `callEWS()` repeats such calls once, like this: */
        response = await net.request(options(`<request>${i}</request>`));
      }
      expectEq(response.status, 200, `close ${i} status`);
      expectEq(response.body, `<response><request>${i}</request></response>`, `close ${i} body`);
      await sleep(20);
    }
  });
}

async function testKilledConnection() {
  await withServer("recovers when the connection is killed mid-request", async (server, net) => {
    let response = await net.request(options("<request>1</request>"));
    expectEq(response.status, 200, "before kill");
    server.killNextRequest = true;
    response = await net.request(options("<request>2</request>"));
    expectEq(response.status, 200, "after kill");
    expectEq(response.body, "<response><request>2</request></response>", "after kill body");
  });
}

async function testDroppedAuthState() {
  await withServer("re-authenticates when the server drops the auth state", async (server, net) => {
    let response = await net.request(options("<request>1</request>"));
    expectEq(response.status, 200, "before drop");
    server.dropAuthState();
    response = await net.request(options("<request>2</request>"));
    expectEq(response.status, 200, "after drop");
    expectEq(response.body, "<response><request>2</request></response>", "after drop body");
  });
}

async function testWrongPassword() {
  await withServer("wrong password surfaces the 401, bounded", async server => {
    let net = new NetSession(server.url, "ntlm-test-wrong-password", kUser, "wrong password");
    let response = await net.request(options("<request>1</request>"));
    expectEq(response.status, 401, "wrong password status");
    // The `login` handler supplies the credentials at most once per request,
    // to protect against Windows account lockout
    expectAtMost(server.requests, 8, "no login hammering");
  });
}

async function testStreaming() {
  await withServer("streams a chunked response after authenticating", async (server, net) => {
    server.streamChunks = ["<Envelope>1</Envelope>", "<Envelope>2</Envelope>", "<Envelope>3</Envelope>"];
    let received: string[] = [];
    let response = await net.request(options("<request>stream</request>"),
      async chunk => {
        received.push(chunk);
      });
    expectEq(response.ok, true, "stream ok");
    expectEq(received.join(""), server.streamChunks.join(""), "stream content");
    expectEq(received.length > 1, true, "actually streamed, not buffered");
    expectEq(server.handshakesCompleted, 1, "stream connection authenticated");
  });
}

async function testAbortStream() {
  await withServer("closing the session aborts the stream", async (server, net) => {
    server.streamChunks = ["<Envelope>1</Envelope>"];
    server.keepStreamOpen = true;
    let received: string[] = [];
    let promise = net.request(options("<request>stream</request>"),
      async chunk => {
        received.push(chunk);
      });
    while (!received.length) {
      await sleep(10);
    }
    await net.close();
    let rejected = false;
    await promise.catch(() => rejected = true);
    expectEq(rejected, true, "stream request rejected after abort");
  });
}

async function testTruncatedResponse() {
  await withServer("reports a truncated response as a network error", async (server, net) => {
    server.endWhileResponding = true; // FIN in the middle of the response
    let ex: any;
    await net.request(options("<request>1</request>")).catch(caught => ex = caught);
    // `callStream()` re-opens the stream only for network errors
    expectEq(isNetworkError(ex), true, `truncated response: ${ex?.message}`);
  });
}

async function testTruncatedStream() {
  await withServer("reports a truncated stream as a network error", async (server, net) => {
    server.streamChunks = ["<Envelope>1</Envelope>", "<Envelope>2</Envelope>"];
    server.endWhileResponding = true; // FIN after the first chunk
    let received: string[] = [];
    let ex: any;
    await net.request(options("<request>stream</request>"), async chunk => {
      received.push(chunk);
    }).catch(caught => ex = caught);
    expectEq(received.join(""), "<Envelope>1</Envelope>", "chunks before the close");
    expectEq(isNetworkError(ex), true, `truncated stream: ${ex?.message}`);
  });
}

async function testNoContent() {
  await withServer("returns a response that has no body, without hanging", async (server, net) => {
    server.noContent = true;
    let response = await net.request(options("<request>1</request>"));
    expectEq(response.status, 204, "204 status");
    expectEq(response.body, "", "204 body");
  });
}

async function testCookies() {
  await withServer("keeps cookies, like load balancer affinity cookies", async (server, net) => {
    server.setCookie = "X-BackEndCookie=abc123";
    await net.request(options("<request>1</request>"));
    await net.request(options("<request>2</request>"));
    expectEq(server.cookieLog[server.cookieLog.length - 1], "X-BackEndCookie=abc123", "cookie sent back");
  });
}

app.whenReady().then(async () => {
  try {
    await testBasicAndReuse();
    await testParallelStorm();
    await testServerClosesConnections();
    await testKilledConnection();
    await testDroppedAuthState();
    await testWrongPassword();
    await testStreaming();
    await testAbortStream();
    await testTruncatedResponse();
    await testTruncatedStream();
    await testNoContent();
    await testCookies();
  } catch (ex) {
    failures++;
    console.error(ex);
  }
  // "all checks passed" is the marker that `ntlmChromium.test.ts` looks for
  console.log(failures ? `${failures} of ${checks} checks FAILED` : `all checks passed (${checks})`);
  app.exit(failures ? 1 : 0);
});
