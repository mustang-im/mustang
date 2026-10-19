import type { JMAPAccount } from "./JMAPAccount";
import type { TJMAPAPIErrorResponse, TJMAPAPIRequest, TJMAPAPIResponse, TJMAPStateChange } from "./TJMAPGeneric";
import { JMAPRequestError } from "./JMAPError";
import { ConnectError } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { minorError } from "../../util/error";
import { getComputerOn } from "../../util/backend-wrapper";
import { Lock } from "../../util/flow/Lock";
import { Semaphore } from "../../util/flow/Semaphore";
import { Timeout } from "../../util/flow/Timeout";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

/** JMAP API requests and push notifications over one WebSocket connection
 * <https://www.rfc-editor.org/rfc/rfc8887> */
export class JMAPWebSocket {
  protected socket: WebSocket | null = null;
  protected state: "connecting" | "open" | "closed" = "connecting";
  protected closedByUs = false;
  /** Why the connection broke */
  protected error: Error | null = null;
  readonly closed: Promise<void>;
  protected onClosed: () => void;
  protected opened: (ex: Error | null) => void = () => {};
  protected pending = new Map<string, { resolve: (response: TJMAPAPIResponse) => void, reject: (ex: Error) => void }>();
  protected requestCounter = 0;
  protected readonly parallelRequests: Semaphore;
  protected stateChanges = Promise.resolve();
  protected heartbeat: ReturnType<typeof setInterval> | null = null;
  protected stopWatchingWakeUp: () => void = () => {};
  /** Stalwart keeps the access rights of a connection from when it was opened,
   * so an account shared with us later is only available over a new connection. */
  readonly sessionState: string;
  /** The server can push changes over this connection <https://www.rfc-editor.org/rfc/rfc8887#section-4.3.5> */
  readonly supportsPush: boolean;
  /** The backend adds the `Authorization` header by URL, so the handshakes must not overlap */
  protected static handshakeLock = new Lock();

  constructor(protected readonly account: JMAPAccount, readonly url: string) {
    let maxRequests = sanitize.integer(account.session.capabilities["urn:ietf:params:jmap:core"]?.maxConcurrentRequests, 4);
    this.parallelRequests = new Semaphore(Math.max(1, maxRequests));
    this.sessionState = account.session.state;
    this.supportsPush = !!account.session.capabilities["urn:ietf:params:jmap:websocket"]?.supportsPush;
    this.closed = new Promise(resolve => this.onClosed = resolve);
  }

  /** RFC 8887 requires TLS. We allow a server on this computer without TLS, e.g. for tests.
   * @returns null, if we must not connect to this URL */
  static allowedURL(url: string): string | null {
    url = sanitize.url(url, null, ["wss", "ws"]);
    if (!url) {
      return null;
    }
    try {
      let parsed = new URL(url);
      if (parsed.protocol == "wss:" ||
          ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)) {
        return url;
      }
    } catch (ex) {
    }
    return null;
  }

  get isOpen(): boolean {
    return this.state == "open";
  }

  /** <https://www.rfc-editor.org/rfc/rfc8887#section-4.2>
   * @param authorization `Authorization` header for the handshake
   * @throws if the connection failed */
  async connect(authorization: string): Promise<void> {
    const kConnectTimeoutSec = 30;
    let lock = await JMAPWebSocket.handshakeLock.lock();
    try {
      await appGlobal.remoteApp.setWebSocketAuthorization(this.url, authorization);
      if (this.closedByUs) {
        throw this.closeError();
      }
      let opening = new Promise<Error | null>(resolve => this.opened = resolve);
      let socket = this.socket = new WebSocket(this.url, ["jmap"]);
      socket.onopen = () => {
        this.state = "open";
        this.opened(null);
      };
      socket.onmessage = event => this.onMessage(event.data);
      socket.onerror = () => {
        this.error ??= new ConnectError(null, `JMAP WebSocket: Connection to <${this.url}> ${this.isOpen ? "broke" : "failed"}`);
      };
      socket.onclose = event => this.onClose(event.code);
      let timeout = new Timeout(kConnectTimeoutSec, () =>
        this.closeBroken(new DOMException(`JMAP WebSocket: Connection to <${this.url}> timed out`, "TimeoutError")));
      let ex = await opening;
      timeout.fulfilled();
      if (ex) {
        throw ex;
      }
    } catch (ex) {
      this.closeBroken(ex);
      throw ex;
    } finally {
      await appGlobal.remoteApp.setWebSocketAuthorization(this.url, null);
      lock.release();
    }
    this.startHeartbeat();
    this.watchWakeUp();
  }

  /** Sends a JMAP API request and waits for its response
   * <https://www.rfc-editor.org/rfc/rfc8887#section-4.3.2>
   * @returns null, if the connection closed before we could send the request
   * @throws JMAPRequestError, if the server rejected the request as a whole */
  async request(request: TJMAPAPIRequest): Promise<TJMAPAPIResponse | null> {
    const kTimeoutSec = 60;
    let lock = await this.parallelRequests.lock();
    try {
      if (!this.isOpen) {
        return null;
      }
      let id = String(++this.requestCounter);
      this.send({
        "@type": "Request",
        id: id,
        ...request,
      });
      let response = new Promise<TJMAPAPIResponse>((resolve, reject) => {
        this.pending.set(id, { resolve, reject });
      });
      // No answer means that the connection is most likely dead
      let timeout = new Timeout(kTimeoutSec, () =>
        this.closeBroken(new DOMException(`JMAP WebSocket: No response from <${this.url}> within ${kTimeoutSec}s`, "TimeoutError")));
      try {
        return await response;
      } finally {
        timeout.fulfilled();
      }
    } finally {
      lock.release();
    }
  }

  /** Asks the server to push changes
   * <https://www.rfc-editor.org/rfc/rfc8887#section-4.3.5.2>
   * @param dataTypes e.g. `["Email", "Identity"]`
   * @param pushState from the last connection, so that the server sends the changes since then */
  enablePush(dataTypes: string[], pushState?: string) {
    this.send({
      "@type": "WebSocketPushEnable",
      dataTypes: dataTypes,
      pushState: pushState,
    });
  }

  /** Closes the connection, once the requests sent over it have their answers */
  async closeWhenIdle() {
    let locks = [];
    for (let i = 0; i < this.parallelRequests.maxParallel; i++) {
      locks.push(await this.parallelRequests.lock());
    }
    this.close();
    for (let lock of locks) {
      lock.release();
    }
  }

  close() {
    this.closedByUs = true;
    this.socket?.close();
    this.onClose();
  }

  protected closeBroken(ex: Error) {
    this.error ??= ex;
    this.socket?.close();
    this.onClose();
  }

  protected send(message: Record<string, any>) {
    if (!this.isOpen) {
      throw this.closeError();
    }
    this.socket.send(JSON.stringify(message));
  }

  protected onMessage(data: string | Blob | ArrayBuffer) {
    if (typeof data != "string") {
      return;
    }
    let message: Record<string, any>;
    try {
      message = JSON.parse(data);
    } catch (ex) {
      this.account.dataError(new Error("JMAP WebSocket: Server sent invalid JSON: " + ex.message));
      return;
    }
    let type = message["@type"];
    if (type == "Response" || type == "RequestError") {
      let requestID = message.requestId;
      // <compat for="Stalwart">
      // Stalwart omits the `requestId` in `RequestError`, against RFC 8887 section 4.3.4.
      // It answers the requests in order, so the error is for the oldest pending request.
      if (type == "RequestError" && requestID == null) {
        requestID = this.pending.keys().next().value;
      }
      // </compat>
      let pending = this.pending.get(requestID);
      if (!pending) {
        this.account.dataError(new Error("JMAP WebSocket: Server sent an answer to an unknown request: " + JSON.stringify(message).substring(0, 200)));
        return;
      }
      this.pending.delete(requestID);
      if (type == "Response") {
        pending.resolve(message as TJMAPAPIResponse);
      } else {
        pending.reject(new JMAPRequestError(message as TJMAPAPIErrorResponse));
      }
    } else if (type == "StateChange") {
      this.stateChanges = this.stateChanges
        .then(() => this.account.syncStateChange(message as TJMAPStateChange))
        .catch(minorError);
    }
  }

  /** Also called when we close it, because the browser reports a dead connection only after a long time */
  protected onClose(code?: number) {
    if (this.state == "closed") {
      return;
    }
    this.state = "closed";
    clearInterval(this.heartbeat);
    this.stopWatchingWakeUp();
    let ex = this.closeError(code);
    this.opened(ex);
    for (let pending of this.pending.values()) {
      pending.reject(ex);
    }
    this.pending.clear();
    this.onClosed();
  }

  protected closeError(code?: number): Error {
    if (this.error) {
      return this.error;
    }
    if (this.closedByUs) {
      return new DOMException("JMAP WebSocket: Closed", "AbortError");
    }
    return new ConnectError(null, `JMAP WebSocket: Server closed the connection` + (code ? ` with code ${code}` : ""));
  }

  /** Finds a dead connection. Also notices when the timers stood still, because the computer slept. */
  protected startHeartbeat() {
    const kTickSec = 30;
    const kHeartbeatSec = 5 * 60;
    let lastTick = Date.now();
    let lastHeartbeat = lastTick;
    this.heartbeat = setInterval(() => {
      let now = Date.now();
      let slept = now - lastTick > 3 * kTickSec * 1000;
      lastTick = now;
      if (slept) {
        this.closeBroken(new ConnectError(null, "JMAP WebSocket: The computer slept"));
      } else if (now - lastHeartbeat >= kHeartbeatSec * 1000) {
        lastHeartbeat = now;
        this.request({
          using: ["urn:ietf:params:jmap:core"],
          methodCalls: [["Core/echo", {}, "heartbeat"]],
        }).catch(minorError);
      }
    }, kTickSec * 1000);
  }

  /** After sleep or a network change, the connection is most likely dead,
   * but the WebSocket would notice that only many minutes later.
   * Until we reconnected, our requests go over HTTP. */
  protected watchWakeUp() {
    let renew = (reason: string) => this.closeBroken(new ConnectError(null, "JMAP WebSocket: " + reason));
    let onOnline = () => renew("The network changed");
    globalThis.addEventListener?.("online", onOnline);
    let computerOn = getComputerOn();
    let wasSleeping = false;
    let unsubscribe = computerOn?.subscribe(() => {
      if (wasSleeping && !computerOn.isSleeping) {
        renew("The computer woke up");
      }
      wasSleeping = computerOn.isSleeping;
    });
    this.stopWatchingWakeUp = () => {
      globalThis.removeEventListener?.("online", onOnline);
      unsubscribe?.();
    };
  }
}
