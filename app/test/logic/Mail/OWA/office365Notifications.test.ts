// @vitest-environment happy-dom
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import { OWAAccount } from "../../../../logic/Mail/OWA/OWAAccount";
import { OWAOffice365Notifications } from "../../../../logic/Mail/OWA/Notification/OWAOffice365Notifications";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

/** Ends each SignalR message */
const kRecordSeparator = "\x1e";

class TestOWAAccount extends OWAAccount {
  readonly notifications: any[][] = [];

  async callOWA(request: any): Promise<any> {
    throw new Error("Unexpected OWA call " + request.action);
  }

  async onNotificationMessages(messages: any[][]) {
    this.notifications.push(...messages);
  }
}

/** One SignalR connection, from `negotiate` until the client or the server ends it */
class TestConnection {
  readonly connectionToken: string;
  /** The messages that the client sent, and when */
  readonly received: { time: number, message: any }[] = [];
  /** When the event stream was opened and closed */
  opened: number | null = null;
  closed: number | null = null;
  protected controller: ReadableStreamDefaultController;
  protected pingTimer: ReturnType<typeof setInterval>;

  constructor(connectionToken: string) {
    this.connectionToken = connectionToken;
  }

  openStream(signal: AbortSignal): ReadableStream {
    this.opened = Date.now();
    signal?.addEventListener("abort", () => {
      if (this.closed == null) {
        this.onClosed();
        this.controller.error(new DOMException("Aborted", "AbortError"));
      }
    });
    return new ReadableStream({
      start: controller => {
        this.controller = controller;
      },
      cancel: () => this.onClosed(),
    });
  }

  /** The server sends a message to the client, as server-sent event */
  send(message: any) {
    this.controller.enqueue(new TextEncoder().encode("data: " + JSON.stringify(message) + kRecordSeparator + "\r\n\r\n"));
  }

  /** The server ends the event stream */
  end() {
    this.onClosed();
    this.controller.close();
  }

  onReceived(message: any) {
    this.received.push({ time: Date.now(), message });
    if (this.received.length == 1 && message.protocol == "json") {
      this.send({}); // handshake response
      this.pingTimer = setInterval(() => this.send({ type: 6 }), 15 * 1000);
    }
  }

  protected onClosed() {
    this.closed ??= Date.now();
    clearInterval(this.pingTimer);
  }
}

/** Answers the requests of the notification channel like a SignalR v2 server,
 * see <https://github.com/dotnet/aspnetcore/tree/main/src/SignalR/docs/specs> */
class TestServer {
  readonly account: TestOWAAccount;
  readonly connections: TestConnection[] = [];
  /** Requests without the account's current access token */
  readonly rejectedRequests: string[] = [];
  /** The most event streams that were open at the same time */
  maxOpenStreams = 0;
  /** Called when the handshake of a connection is done */
  onHandshake = (_connection: TestConnection) => {};

  constructor(account: TestOWAAccount) {
    this.account = account;
    globalThis.fetch = this.fetch.bind(this) as any;
  }

  async fetch(url: string, options: any): Promise<any> {
    if (options?.headers?.Authorization != this.account.authorizationHeader) {
      this.rejectedRequests.push(url);
      return { ok: false, status: 401, statusText: "Unauthorized" };
    }
    let hubURL = this.account.url + "notificationchannel";
    let { pathname, searchParams } = new URL(url);
    if (options.method == "POST" && pathname == new URL(hubURL).pathname + "/negotiate") {
      expect(searchParams.get("negotiateVersion")).toBe("1");
      let connection = new TestConnection("connection-token-" + this.connections.length);
      this.connections.push(connection);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          negotiateVersion: 1,
          connectionId: "connection-id-" + this.connections.length,
          connectionToken: connection.connectionToken,
          availableTransports: [
            { transport: "WebSockets", transferFormats: ["Text", "Binary"] },
            { transport: "ServerSentEvents", transferFormats: ["Text"] },
            { transport: "LongPolling", transferFormats: ["Text", "Binary"] },
          ],
        }),
      };
    }
    expect(pathname).toBe(new URL(hubURL).pathname);
    let connection = this.connections.find(connection => connection.connectionToken == searchParams.get("id"));
    if (!connection || connection.closed) {
      return { ok: false, status: 404, statusText: "Not Found" };
    }
    if (options.method == "POST") {
      for (let record of options.body.split(kRecordSeparator).filter(Boolean)) {
        connection.onReceived(JSON.parse(record));
      }
      if (connection.received.length == 1) {
        this.onHandshake(connection);
      }
      return { ok: true, status: 200 };
    }
    expect(options.headers.Accept).toBe("text/event-stream");
    let body = connection.openStream(options.signal);
    let openStreams = this.connections.filter(connection => connection.opened != null && connection.closed == null).length;
    this.maxOpenStreams = Math.max(this.maxOpenStreams, openStreams);
    return { ok: true, status: 200, body };
  }
}

function newTestAccount(): TestOWAAccount {
  appGlobal.remoteApp ??= { OWA: {} } as any; // `OWAAccount` needs the backend
  let account = new TestOWAAccount();
  account.url = "https://outlook.office.com/owa/";
  account.authorizationHeader = "Bearer access-token-1";
  return account;
}

/** Starts the notifications, and catches the error that ends them */
function startNotifications(account: TestOWAAccount): { error: Error | null } {
  let result = { error: null };
  new OWAOffice365Notifications(account).start()
    .catch(ex => result.error = ex);
  return result;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"] });
});

afterEach(() => {
  vi.useRealTimers();
});

test("OWA: Office 365: Notifications arrive over SignalR v2", async () => {
  let account = newTestAccount();
  let server = new TestServer(account);
  let notification = { id: "NewMailNotification", ItemId: "item-1" };
  server.onHandshake = connection => connection.send({ type: 1, target: "notify", arguments: [[notification]] });

  let result = startNotifications(account);
  await vi.advanceTimersByTimeAsync(60 * 1000);

  expect(result.error).toBeNull();
  expect(server.connections.length).toBe(1);
  // The handshake must be the first message
  expect(server.connections[0].received[0].message).toEqual({ protocol: "json", version: 1 });
  expect(account.notifications).toEqual([[notification]]);
});

test("OWA: Office 365: The notification channel stays open for hours, also when the access token of the account changes, and the client is never silent for 30 s", async () => {
  let account = newTestAccount();
  let server = new TestServer(account);

  let result = startNotifications(account);
  await vi.advanceTimersByTimeAsync(90 * 60 * 1000);
  // e.g. after a new login. The server takes only the new token from now on.
  account.authorizationHeader = "Bearer access-token-2";
  await vi.advanceTimersByTimeAsync(90 * 60 * 1000);

  expect(result.error).toBeNull();
  expect(server.rejectedRequests).toEqual([]);
  expect(server.maxOpenStreams).toBe(1);
  // The server closes a connection when the client sent nothing for 30 s
  for (let connection of server.connections.filter(connection => connection.opened != null)) {
    let times = [...connection.received.map(received => received.time), connection.closed ?? Date.now()];
    for (let i = 1; i < times.length; i++) {
      expect(times[i] - times[i - 1]).toBeLessThan(30 * 1000);
    }
  }
  let current = server.connections.at(-1);
  expect(current.closed).toBeNull();
  expect(Date.now() - current.received.at(-1).time).toBeLessThan(30 * 1000);
});

test("OWA: Office 365: The server closes the notification channel with an error", async () => {
  let account = newTestAccount();
  let server = new TestServer(account);
  server.onHandshake = connection => connection.send({ type: 7, error: "Server is shutting down" });

  let result = startNotifications(account);
  await vi.advanceTimersByTimeAsync(10 * 60 * 1000);

  expect(result.error?.message).toContain("Server is shutting down");
  expect(server.connections.length).toBe(1);
});

test("OWA: Office 365: A server that ends the notification channel right away doesn't keep us busy", async () => {
  let account = newTestAccount();
  let server = new TestServer(account);
  // After a second, so that a reconnect loop shows as many connections, and doesn't hang the test
  server.onHandshake = connection => setTimeout(() => connection.end(), 1000);

  startNotifications(account);
  await vi.advanceTimersByTimeAsync(10 * 60 * 1000);

  // At most one connection per minute
  expect(server.connections.length).toBeLessThanOrEqual(10);
});
