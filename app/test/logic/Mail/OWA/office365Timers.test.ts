// @vitest-environment happy-dom
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import { OWAAccount } from "../../../../logic/Mail/OWA/OWAAccount";
import { OWAOffice365Notifications } from "../../../../logic/Mail/OWA/Notification/OWAOffice365Notifications";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

class TestOWAAccount extends OWAAccount {
  async callOWA(request: any): Promise<any> {
    if (request.action == "GetAccessTokenforResource") {
      return { AccessToken: "notification-token" };
    }
    throw new Error("Unexpected OWA call " + request.action);
  }
}

/** An event stream that sends a keep-alive every 10 s */
function keepAliveStream(): ReadableStream {
  return new ReadableStream({
    start(controller) {
      function send() {
        controller.enqueue(new TextEncoder().encode("data: {}\n\n"));
        setTimeout(send, 10 * 1000);
      }
      send();
    },
  });
}

/** Answers the notification channel requests. The event stream stays open.
 * @returns the minutes after the start at which we sent each ping and abort */
function serve(negotiateResponse: any): { pings: number[], aborts: number[] } {
  let start = Date.now();
  let requests = { pings: [], aborts: [] };
  globalThis.fetch = (async (url: string) => {
    let minutes = Math.round((Date.now() - start) / 60000);
    if (url.includes("notificationchannel/negotiate")) {
      return { ok: true, status: 200, json: async () => negotiateResponse };
    }
    if (url.includes("notificationchannel/connect")) {
      return { ok: true, status: 200, body: keepAliveStream() };
    }
    if (url.includes("notificationchannel/ping")) {
      requests.pings.push(minutes);
    }
    if (url.includes("notificationchannel/abort")) {
      requests.aborts.push(minutes);
    }
    return { ok: true, status: 200 };
  }) as any;
  return requests;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"] });
});

afterEach(() => {
  vi.useRealTimers();
});

test("OWA: Office 365: Ping every 5 minutes, and renew the access token after 40 minutes, whatever SignalR timeouts the server announces", async () => {
  appGlobal.remoteApp ??= { OWA: {} } as any; // `OWAAccount` needs the backend
  let account = new TestOWAAccount();
  account.url = "https://outlook.office.com/owa/";
  account.authorizationHeader = "Bearer main-token";
  // In seconds, unlike the minutes that we need
  let requests = serve({ ConnectionToken: "token", KeepAliveTimeout: 110, TransportConnectTimeout: 10 });

  new OWAOffice365Notifications(account).start()
    .catch(() => undefined);
  await vi.advanceTimersByTimeAsync(41 * 60 * 1000);

  expect(requests.pings).toEqual([5, 10, 15, 20, 25, 30, 35, 40]);
  expect(requests.aborts).toEqual([40]);
});
