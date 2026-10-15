// @vitest-environment happy-dom
import { EWSAccount } from "../../../../logic/Mail/EWS/EWSAccount";
import { AuthMethod } from "../../../../logic/Abstract/Account";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

/** How the server answers a `GetStreamingEvents` request */
type Answer =
  /** The network is down, e.g. right after the computer woke up */
  "network error" |
  /** Streams heartbeats, like a healthy server */
  "heartbeats" |
  /** One heartbeat, and then nothing, like a TCP connection that died silently */
  "silence" |
  "HTTP 503" |
  /** An error that the server would answer every time */
  "refused";

/** An Exchange server whose notification stream fails in various ways */
class TestEWSAccount extends EWSAccount {
  /** How the server answers each stream request, in order. Then heartbeats. */
  answers: Answer[] = [];
  /** Each stream request, in order */
  readonly streams: { signal: AbortSignal, authorization: string }[] = [];
  readonly reportedErrors: any[] = [];

  async callEWS(request: any): Promise<any> {
    if (request.m$Subscribe) {
      return { SubscriptionId: "subscription-1" };
    }
    if (request.m$Unsubscribe) {
      return {};
    }
    throw new Error("Unexpected EWS call " + JSON.stringify(request));
  }

  async stream(options: any): Promise<any> {
    let signal = options.signal as AbortSignal;
    this.streams.push({ signal, authorization: options.headers.Authorization });
    let answer = this.answers.shift() ?? "heartbeats";
    if (answer == "network error") {
      throw new TypeError("Failed to fetch");
    }
    if (answer == "HTTP 503") {
      return new Response("", { status: 503, statusText: "Service Unavailable" });
    }
    let interval: ReturnType<typeof setInterval>;
    let body = new ReadableStream({
      start(controller) {
        const send = (xml: string) => controller.enqueue(new TextEncoder().encode(xml));
        if (answer == "refused") {
          send(envelope(`ResponseClass="Error"`, "ErrorInvalidSubscription", "Closed"));
          controller.close();
          return;
        }
        send(envelope(`ResponseClass="Success"`, "NoError", "OK"));
        if (answer == "heartbeats") {
          interval = setInterval(() => send(envelope(`ResponseClass="Success"`, "NoError", "OK")), 45 * 1000);
        }
        // Like `fetch()`
        signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.error(signal.reason);
        });
      },
    });
    return { ok: true, status: 200, body };
  }
}

/** A `GetStreamingEvents` response message, e.g. a heartbeat */
function envelope(responseClass: string, responseCode: string, connectionStatus: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
    <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
      <Body>
        <GetStreamingEventsResponse xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">
          <ResponseMessages>
            <GetStreamingEventsResponseMessage ${responseClass}>
              <MessageText>Test</MessageText>
              <ResponseCode>${responseCode}</ResponseCode>
              <ConnectionStatus>${connectionStatus}</ConnectionStatus>
            </GetStreamingEventsResponseMessage>
          </ResponseMessages>
        </GetStreamingEventsResponse>
      </Body>
    </Envelope>`;
}

let account: TestEWSAccount;

beforeEach(() => {
  // Skip the reconnect delay and the heartbeat timeout
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
  account = new TestEWSAccount();
  account.name = "Test";
  account.username = "user@example.com";
  account.emailAddress = account.username;
  account.url = "https://exchange.example.com/EWS/Exchange.asmx";
  account.authMethod = AuthMethod.Unknown; // no credentials needed for the stream request
  account.errorCallback = ex => account.reportedErrors.push(ex);
  globalThis.fetch = ((_url: string, options: any) => account.stream(options)) as any;
});

afterEach(async () => {
  await account.unsubscribeAllSubscriptions();
  vi.useRealTimers();
});

/** Lets the time pass, e.g. the reconnect delay, until `condition` is true */
async function passTimeUntil(condition: () => boolean, maxSeconds = 10 * 60) {
  for (let second = 0; second < maxSeconds && !condition(); second++) {
    await vi.advanceTimersByTimeAsync(1000);
  }
  expect(condition()).toBe(true);
}

test("The network is not back yet after wake-up, so we keep reconnecting", async () => {
  account.answers = ["network error", "network error", "network error"];

  await account.subscribeToNotifications();

  await passTimeUntil(() => account.streams.length == 4);
  expect(account.reportedErrors).toEqual([]);
});

test("The connection died silently, so we reconnect when the heartbeats stop", async () => {
  account.answers = ["silence"];

  await account.subscribeToNotifications();

  await passTimeUntil(() => account.streams.length == 2);
  expect(account.streams[0].signal.aborted).toBe(true);
  expect(account.reportedErrors).toEqual([]);
});

test("A stream with heartbeats stays open", async () => {
  await account.subscribeToNotifications();

  await vi.advanceTimersByTimeAsync(10 * 60 * 1000);

  expect(account.streams.length).toBe(1);
  expect(account.streams[0].signal.aborted).toBe(false);
});

test("The server is temporarily unavailable, so we try again", async () => {
  account.answers = ["HTTP 503"];

  await account.subscribeToNotifications();

  await passTimeUntil(() => account.streams.length == 2);
  expect(account.reportedErrors).toEqual([]);
});

test("The server refuses the stream, so we report that, and don't ask again", async () => {
  account.answers = ["refused", "refused"];

  await account.subscribeToNotifications();

  await passTimeUntil(() => account.reportedErrors.length == 1);
  await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
  expect(account.streams.length).toBe(1);
  expect(account.reportedErrors.map(ex => ex.type)).toEqual(["ErrorInvalidSubscription"]);
});

test("The access token expired while the computer slept, so we refresh it before we reconnect", async () => {
  account.authMethod = AuthMethod.OAuth2;
  let oAuth2 = {
    isLoggedIn: false,
    authorizationHeader: "Bearer expired",
    async login(interactive: boolean) {
      expect(interactive).toBe(false);
      this.isLoggedIn = true;
      this.authorizationHeader = "Bearer fresh";
    },
  };
  account.oAuth2 = oAuth2 as any;

  await account.subscribeToNotifications();

  await passTimeUntil(() => account.streams.length == 1);
  expect(account.streams[0].authorization).toBe("Bearer fresh");
  expect(account.reportedErrors).toEqual([]);
});
