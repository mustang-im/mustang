import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import { JMAPWebSocket } from "../../../../logic/Mail/JMAP/JMAPWebSocket";
import { JMAPRequestError } from "../../../../logic/Mail/JMAP/JMAPError";
import { AuthMethod } from "../../../../logic/Abstract/Account";
import type { TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import { waitFor } from "../../util/waitFor";
import { ArrayColl } from "svelte-collections";
import { afterEach, beforeAll, expect, test, vi } from "vitest";

/** JMAP over WebSocket, RFC 8887.
 * The server frames below were recorded from Stalwart v0.16.26. */

const kWebSocketURL = "wss://example.com/jmap/ws";

/** What the backend adds as `Authorization` header to the WebSocket handshake, by URL */
let authorizations = new Map<string, string>();
/** All sockets that were opened, newest last */
let sockets: FakeServerSocket[] = [];
let accounts: JMAPAccount[] = [];
/** The next socket fails to open */
let refuseNextSocket = false;

/** Plays the server side of the platform `WebSocket` */
class FakeServerSocket {
  readyState = 0;
  protocol = "";
  onopen: (event: any) => void;
  onmessage: (event: any) => void;
  onerror: (event: any) => void;
  onclose: (event: any) => void;
  /** The `Authorization` header of the handshake */
  authorization: string | undefined;
  /** What the client sent, parsed */
  received: any[] = [];
  /** Requests that we did not answer yet, by request ID */
  heldBack = new Map<string, any>();
  /** false = the test answers with `answer()` */
  autoAnswer = true;

  constructor(readonly url: string, readonly protocols: string[]) {
    this.authorization = authorizations.get(url);
    sockets.push(this);
    let refuse = refuseNextSocket;
    refuseNextSocket = false;
    setTimeout(() => {
      if (refuse) {
        this.onerror?.({ type: "error" });
        this.drop(1006);
        return;
      }
      this.readyState = 1;
      this.protocol = "jmap";
      this.onopen?.({ type: "open" });
    }, 1);
  }

  send(text: string) {
    let message = JSON.parse(text);
    this.received.push(message);
    if (message["@type"] != "Request") {
      return;
    }
    this.heldBack.set(message.id, message);
    if (this.autoAnswer) {
      setTimeout(() => this.answer(message.id), 1);
    }
  }

  /** Answers like Stalwart: `Core/echo` returns its arguments */
  answer(requestID: string) {
    let request = this.heldBack.get(requestID);
    this.heldBack.delete(requestID);
    this.sendText({
      "@type": "Response",
      methodResponses: request.methodCalls.map(([method, args, callID]) => [method, args, callID]),
      sessionState: "d1655760",
      requestId: requestID,
    });
  }

  sendText(json: any) {
    this.onmessage?.({ data: JSON.stringify(json) });
  }

  /** The connection ended */
  drop(code = 1006) {
    this.readyState = 3;
    this.onclose?.({ code });
  }

  close() {
    this.readyState = 2;
    setTimeout(() => this.drop(1006), 1); // Stalwart drops the TCP connection instead of answering the close
  }

  pushEnables(): any[] {
    return this.received.filter(message => message["@type"] == "WebSocketPushEnable");
  }
}

beforeAll(() => {
  globalThis.WebSocket = FakeServerSocket as any;
  Object.defineProperty(globalThis.navigator, "onLine", { value: true, configurable: true });
});

afterEach(async () => {
  for (let account of accounts) {
    await account.disconnect();
  }
  accounts = [];
  sockets = [];
  authorizations.clear();
  refuseNextSocket = false;
});

function newAccount(webSocketCapability: any = { url: kWebSocketURL, supportsPush: true }, maxConcurrentRequests = 4, username = "fred@example.com"): JMAPAccount {
  appGlobal.remoteApp = {
    kyCreate: () => ({ post: async () => { throw new Error("Should not use HTTP") } }),
    setWebSocketAuthorization: async (url: string, authorization: string | null) => {
      authorization ? authorizations.set(url, authorization) : authorizations.delete(url);
    },
  } as any;
  let account = new JMAPAccount();
  account.name = "Test";
  account.authMethod = AuthMethod.Password;
  account.username = username;
  account.emailAddress = username;
  account.password = "secret";
  account.accountID = "o";
  account.logging = false;
  account.session = {
    capabilities: {
      "urn:ietf:params:jmap:core": { maxConcurrentRequests },
      ...(webSocketCapability ? { "urn:ietf:params:jmap:websocket": webSocketCapability } : {}),
    },
    accounts: { o: { accountCapabilities: { "urn:ietf:params:jmap:mail": {} } } },
    primaryAccounts: { "urn:ietf:params:jmap:mail": "o" },
    apiUrl: "https://example.com/jmap/",
    eventSourceUrl: "https://example.com/jmap/eventsource/?types={types}&closeafter={closeafter}&ping={ping}",
    state: "d1655760",
  } as any as TJMAPSession;
  accounts.push(account);
  return account;
}

/** Like `login()` after the session: opens the WebSocket */
async function connect(account: JMAPAccount): Promise<FakeServerSocket | undefined> {
  await (account as any).connectWebSocket();
  return sockets.at(-1);
}

/** Records the requests over HTTP */
function stubHTTP(account: JMAPAccount): any[] {
  let requests: any[] = [];
  account.httpPost = async (url: string, request: any) => {
    requests.push(request);
    return { methodResponses: [["Core/echo", { overHTTP: true }, "c1"]], sessionState: "d1655760" };
  };
  return requests;
}

/** Records the push connections over EventSource, and keeps each open until `disconnect()` */
function stubEventSource(): string[] {
  let urls: string[] = [];
  globalThis.fetch = (async (url: string, options: any) => {
    urls.push(url);
    return {
      ok: true,
      body: new ReadableStream({
        start: controller => options.signal.addEventListener("abort", () => controller.error(new DOMException("Aborted", "AbortError"))),
      }),
    };
  }) as any;
  return urls;
}

test("All API requests go over the WebSocket, opened with subprotocol jmap and our login", async () => {
  let account = newAccount();
  let socket = await connect(account);

  let responses = await account.makeCalls([["Core/echo", { hello: true }]]);

  expect(responses).toEqual([["Core/echo", { hello: true }, "c1"]]);
  expect(socket.url).toBe(kWebSocketURL);
  expect(socket.protocols).toEqual(["jmap"]);
  expect(socket.authorization).toBe("Basic " + btoa("fred@example.com:secret"));
  expect(authorizations.size).toBe(0); // only during the handshake
  let request = socket.received.find(message => message["@type"] == "Request");
  expect(request.id).toBeTruthy();
  expect(request.using).toContain("urn:ietf:params:jmap:core");
  expect(request.methodCalls).toEqual([["Core/echo", { hello: true }, "c1"]]);
});

test("Responses are matched to their requests, also when they come in a different order", async () => {
  let account = newAccount();
  let socket = await connect(account);
  socket.autoAnswer = false;

  let first = account.makeSingleCall("Core/echo", { n: 1 });
  let second = account.makeSingleCall("Core/echo", { n: 2 });
  await waitFor(() => socket.heldBack.size == 2);
  let [firstID, secondID] = [...socket.heldBack.keys()];
  socket.answer(secondID);
  socket.answer(firstID);

  expect(await first).toEqual({ n: 1 });
  expect(await second).toEqual({ n: 2 });
});

test("A request error fails only its request", async () => {
  let account = newAccount();
  let socket = await connect(account);
  socket.autoAnswer = false;

  let echo = account.makeSingleCall("Core/echo", { n: 1 });
  let tooLarge = account.makeSingleCall("Core/echo", { n: 2 });
  await waitFor(() => socket.heldBack.size == 2);
  let [echoID, tooLargeID] = [...socket.heldBack.keys()];
  socket.heldBack.delete(tooLargeID);
  socket.sendText({
    "@type": "RequestError",
    requestId: tooLargeID,
    type: "urn:ietf:params:jmap:error:limit",
    limit: "maxCallsInRequest",
    status: 400,
    detail: "The request exceeds the maximum number of calls in a single request.",
  });
  socket.answer(echoID);

  await expect(tooLarge).rejects.toThrow(JMAPRequestError);
  await expect(tooLarge).rejects.toMatchObject({ type: "urn:ietf:params:jmap:error:limit", httpCode: 400 });
  expect(await echo).toEqual({ n: 1 });
});

test("A request error without requestId, like from Stalwart, fails the oldest request", async () => {
  let account = newAccount();
  let socket = await connect(account);
  socket.autoAnswer = false;

  let tooLarge = account.makeSingleCall("Core/echo", { n: 1 });
  let echo = account.makeSingleCall("Core/echo", { n: 2 });
  await waitFor(() => socket.heldBack.size == 2);
  let [tooLargeID, echoID] = [...socket.heldBack.keys()];
  socket.heldBack.delete(tooLargeID);
  socket.sendText({ // recorded from Stalwart
    "@type": "RequestError",
    type: "urn:ietf:params:jmap:error:limit",
    limit: "maxCallsInRequest",
    status: 400,
    detail: "The request exceeds the maximum number of calls in a single request.",
  });
  socket.answer(echoID);

  await expect(tooLarge).rejects.toThrow("maximum number of calls");
  expect(await echo).toEqual({ n: 2 });
});

test("We send no more requests at the same time than the server allows", async () => {
  let account = newAccount(undefined, 2);
  let socket = await connect(account);
  socket.autoAnswer = false;

  let calls = [1, 2, 3].map(n => account.makeSingleCall("Core/echo", { n }));
  await waitFor(() => socket.heldBack.size == 2);
  await new Promise(resolve => setTimeout(resolve, 50));
  expect(socket.heldBack.size).toBe(2);
  socket.answer([...socket.heldBack.keys()][0]);
  await waitFor(() => socket.heldBack.size == 2);
  for (let id of [...socket.heldBack.keys()]) {
    socket.answer(id);
  }

  expect(await Promise.all(calls)).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }]);
});

test("When the connection drops, waiting requests fail, the next use HTTP, and we reconnect", async () => {
  let account = newAccount();
  let socket = await connect(account);
  socket.autoAnswer = false;
  let httpRequests = stubHTTP(account);

  let waiting = account.makeSingleCall("Core/echo", { n: 1 });
  await waitFor(() => socket.heldBack.size == 1);
  socket.drop();

  await expect(waiting).rejects.toThrow("closed");
  expect(await account.makeSingleCall("Core/echo", {})).toEqual({ overHTTP: true });
  expect(httpRequests.length).toBe(1);
  expect(httpRequests[0]["@type"]).toBeUndefined();

  await waitFor(() => sockets.length == 2 && sockets[1].readyState == 1);
  expect(await account.makeSingleCall("Core/echo", { again: true })).toEqual({ again: true });
  expect(httpRequests.length).toBe(1);
});

test("Push: we ask for our data types, and a change syncs that type", async () => {
  let account = newAccount();
  let synced: string[][] = [];
  account.sync = async (type: string, toState?: string) => {
    synced.push([type, toState]);
  };
  let socket = await connect(account);
  let eventSourceURLs = stubEventSource();

  await account.startPushListener();

  expect(socket.pushEnables().length).toBe(1);
  expect(socket.pushEnables()[0].dataTypes).toEqual(expect.arrayContaining(["Email", "Identity"]));
  socket.sendText({ "@type": "StateChange", changed: { o: { Mailbox: "sai", Email: "sai" } } }); // recorded from Stalwart
  await waitFor(() => synced.length == 2);
  expect(synced).toEqual([["Mailbox", "sai"], ["Email", "sai"]]);
  expect(eventSourceURLs).toEqual([]);
});

test("Push: after a reconnect, we enable push again, with the last pushState", async () => {
  let account = newAccount();
  account.sync = async () => {};
  let firstSocket = await connect(account);
  await account.startPushListener();
  expect(firstSocket.pushEnables()[0].pushState).toBeUndefined();
  firstSocket.sendText({ "@type": "StateChange", changed: { o: { Email: "d35ecb040aab" } }, pushState: "bbb" });
  await waitFor(() => (account as any).pushState == "bbb");

  firstSocket.drop(1001);
  await waitFor(() => sockets.length == 2 && sockets[1].pushEnables().length == 1);

  expect(sockets[1].pushEnables()[0].pushState).toBe("bbb");
  expect(sockets[1].pushEnables()[0].dataTypes).toEqual(firstSocket.pushEnables()[0].dataTypes);
});

test("disconnect() closes the WebSocket, and we don't reconnect", async () => {
  let account = newAccount();
  let socket = await connect(account);

  await account.disconnect();

  await waitFor(() => socket.readyState == 3);
  await new Promise(resolve => setTimeout(resolve, 50));
  expect(sockets.length).toBe(1);
});

test("Without the WebSocket capability, we use HTTP and EventSource", async () => {
  let account = newAccount(null);
  let socket = await connect(account);
  let httpRequests = stubHTTP(account);
  let eventSourceURLs = stubEventSource();

  await account.makeSingleCall("Core/echo", {});
  account.startPushListener().catch(ex => console.error(ex));

  await waitFor(() => eventSourceURLs.length == 1);
  expect(socket).toBeUndefined();
  expect(httpRequests.length).toBe(1);
});

test("A WebSocket without push is not used", async () => {
  let account = newAccount({ url: kWebSocketURL, supportsPush: false });
  let socket = await connect(account);
  let eventSourceURLs = stubEventSource();

  account.startPushListener().catch(ex => console.error(ex));

  await waitFor(() => eventSourceURLs.length == 1);
  expect(socket).toBeUndefined();
});

test("When the WebSocket fails at login, we use HTTP and EventSource", async () => {
  let account = newAccount();
  refuseNextSocket = true;
  await connect(account);
  let httpRequests = stubHTTP(account);
  let eventSourceURLs = stubEventSource();

  await account.makeSingleCall("Core/echo", {});
  account.startPushListener().catch(ex => console.error(ex));

  await waitFor(() => eventSourceURLs.length == 1);
  expect(httpRequests.length).toBe(1);
  expect(sockets.length).toBe(1);
  expect(authorizations.size).toBe(0);
});

test("Without a way to authenticate the WebSocket, e.g. in the browser, we use HTTP", async () => {
  let account = newAccount();
  delete appGlobal.remoteApp.setWebSocketAuthorization;
  let socket = await connect(account);
  expect(socket).toBeUndefined();
});

test("Only wss: is allowed, except on this computer", () => {
  expect(JMAPWebSocket.allowedURL("wss://example.com/jmap/ws")).toBe("wss://example.com/jmap/ws");
  expect(JMAPWebSocket.allowedURL("ws://example.com/jmap/ws")).toBeNull();
  expect(JMAPWebSocket.allowedURL("ws://127.0.0.1:18080/jmap/ws")).toBe("ws://127.0.0.1:18080/jmap/ws");
  expect(JMAPWebSocket.allowedURL("ws://localhost/jmap/ws")).toBe("ws://localhost/jmap/ws");
  expect(JMAPWebSocket.allowedURL("ws://[::1]/jmap/ws")).toBe("ws://[::1]/jmap/ws");
  expect(JMAPWebSocket.allowedURL("https://example.com/jmap/ws")).toBeNull();
  expect(JMAPWebSocket.allowedURL(undefined)).toBeNull();
});

test("A plain ws: URL on another computer is not used", async () => {
  let account = newAccount({ url: "ws://example.com/jmap/ws", supportsPush: true });
  let socket = await connect(account);
  expect(socket).toBeUndefined();
});

test("Setting: requests over HTTP, push over WebSocket", async () => {
  let account = newAccount();
  account.callsOverWebSocket = false;
  let socket = await connect(account);
  let httpRequests = stubHTTP(account);
  let eventSourceURLs = stubEventSource();

  await account.makeSingleCall("Core/echo", {});
  await account.startPushListener();

  expect(httpRequests.length).toBe(1);
  expect(socket.received.filter(message => message["@type"] == "Request")).toEqual([]);
  expect(socket.pushEnables().length).toBe(1);
  expect(eventSourceURLs).toEqual([]);
});

test("Setting: requests over WebSocket, push over EventSource", async () => {
  let account = newAccount();
  account.pushOverWebSocket = false;
  let socket = await connect(account);
  let eventSourceURLs = stubEventSource();

  expect(await account.makeSingleCall("Core/echo", { n: 1 })).toEqual({ n: 1 });
  account.startPushListener().catch(ex => console.error(ex));

  await waitFor(() => eventSourceURLs.length == 1);
  expect(socket.pushEnables()).toEqual([]);
});

test("Setting: neither over WebSocket", async () => {
  let account = newAccount();
  account.callsOverWebSocket = false;
  account.pushOverWebSocket = false;
  let socket = await connect(account);
  expect(socket).toBeUndefined();
});

test("The settings are saved, and default to WebSocket", () => {
  let account = newAccount();
  expect(account.callsOverWebSocket).toBe(true);
  expect(account.pushOverWebSocket).toBe(true);
  account.callsOverWebSocket = false;
  account.pushOverWebSocket = false;

  let restored = newAccount();
  appGlobal.me ??= { name: "Fred", emailAddresses: new ArrayColl() } as any; // for `fromConfigJSON()`
  restored.fromConfigJSON(account.toConfigJSON());

  expect(restored.callsOverWebSocket).toBe(false);
  expect(restored.pushOverWebSocket).toBe(false);
});

test("Two accounts on the same server each log in with their own credentials", async () => {
  let fred = newAccount(undefined, 4, "fred@example.com");
  let remoteApp = appGlobal.remoteApp;
  let mary = newAccount(undefined, 4, "mary@example.com");
  appGlobal.remoteApp = remoteApp;

  await Promise.all([connect(fred), connect(mary)]);

  expect(sockets.length).toBe(2);
  expect(sockets.map(socket => socket.authorization).sort()).toEqual([
    "Basic " + btoa("fred@example.com:secret"),
    "Basic " + btoa("mary@example.com:secret"),
  ]);
  expect(await fred.makeSingleCall("Core/echo", { n: 1 })).toEqual({ n: 1 });
  expect(await mary.makeSingleCall("Core/echo", { n: 2 })).toEqual({ n: 2 });
});

test("A request without answer times out, and the dead connection is closed", async () => {
  vi.useFakeTimers();
  try {
    let account = newAccount();
    let webSocket = new JMAPWebSocket(account, kWebSocketURL);
    let connecting = webSocket.connect("Basic Zm9vOmJhcg==");
    await vi.advanceTimersByTimeAsync(10);
    await connecting;
    let socket = sockets[0];
    socket.autoAnswer = false;

    let request = webSocket.request({ using: ["urn:ietf:params:jmap:core"], methodCalls: [["Core/echo", {}, "c1"]] });
    let failure = expect(request).rejects.toThrow("No response");
    await vi.advanceTimersByTimeAsync(61 * 1000);
    await failure;

    expect(socket.readyState).toBeGreaterThanOrEqual(2);
    expect(webSocket.isOpen).toBe(false);
  } finally {
    vi.useRealTimers();
  }
});
