/** The authenticated chat-service WebSocket. Signal tunnels its REST API over one
 * socket: we send WebSocketMessage REQUEST frames and await the matching RESPONSE
 * (by id); the server pushes inbound messages as REQUEST frames (`PUT
 * /api/v1/message`) that we ACK with a 200 RESPONSE. See Docs/01-transport.
 *
 * Auth is passed as `?login=&password=` query params so the same code works in a
 * browser (which can't set WebSocket headers) and on desktop. */
import { encode, decode } from "../Proto/codec";
import { WebSocketMessage, WebSocketMessageType, type WebSocketRequestMessage } from "../Proto/websocket";
import { SignalHosts, type Credentials } from "./SignalApi";
import { signalLog, redactURL } from "../util";

export interface WebSocketLike {
  binaryType: string;
  send(data: Uint8Array): void;
  close(): void;
  onopen: ((ev: any) => void) | null;
  onmessage: ((ev: { data: any }) => void) | null;
  onclose: ((ev: any) => void) | null;
  onerror: ((ev: any) => void) | null;
}

/** Opens a platform WebSocket (browser/Electron global, or `ws` on Node). */
async function openSocket(url: string): Promise<WebSocketLike> {
  let WS: any = (globalThis as any).WebSocket ?? (await import("ws")).WebSocket;
  return new WS(url) as WebSocketLike;
}

interface Pending {
  resolve: (res: { status: number, body?: Uint8Array, headers: string[] }) => void;
  reject: (ex: Error) => void;
}

export class SignalWebSocket {
  protected socket: WebSocketLike | null = null;
  protected nextID = 1;
  protected pending = new Map<number, Pending>();
  protected keepAliveTimer: ReturnType<typeof setInterval> | null = null;

  /** Called for each inbound server REQUEST (e.g. a delivered Envelope). Return
   * the HTTP status to ACK with (200 to accept). */
  onRequest: (req: WebSocketRequestMessage) => Promise<number> = async () => 200;
  /** Called when the socket closes (clean or error), for the account's reconnect. */
  onClose: (() => void) | null = null;

  constructor(readonly path = "/v1/websocket/") {}

  /** Connect the unauthenticated socket (used for device provisioning). */
  async connectUnauthenticated(): Promise<void> {
    return this.connect();
  }

  async connect(creds?: Credentials): Promise<void> {
    let base = SignalHosts.chat.replace(/^https/, "wss");
    let auth = creds ? `?login=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}` : "";
    let url = `${base}${this.path}${auth}`;
    signalLog(`ws connecting ${redactURL(url)}`);
    let socket = await openSocket(url);
    socket.binaryType = "arraybuffer";
    this.socket = socket;
    // Attach onmessage BEFORE awaiting open: an authenticated connect triggers the
    // server to push the queued-message burst immediately, and we must not miss it.
    socket.onmessage = ev => this.onFrame(new Uint8Array(ev.data));
    await new Promise<void>((resolve, reject) => {
      socket.onopen = () => { signalLog("ws connected"); resolve(); };
      socket.onerror = (ev: any) => reject(new Error(`Signal WebSocket connection failed: ${ev?.message ?? ev?.type ?? "error"}`));
      socket.onclose = (ev: any) => reject(new Error(`Signal WebSocket closed during connect (code ${ev?.code ?? "?"})`));
    });
    socket.onclose = (ev: any) => { signalLog(`ws closed (code ${ev?.code ?? "?"} ${ev?.reason ?? ""})`); this.handleClosed(); };
    socket.onerror = (ev: any) => { signalLog("ws error:", ev?.message ?? ev?.type ?? ev); this.handleClosed(); };
    this.startKeepAlive();
  }

  /** Sends a REST request over the socket and resolves with the response. */
  async request(verb: string, path: string, body?: Uint8Array, headers: string[] = []): Promise<{ status: number, body?: Uint8Array, headers: string[] }> {
    if (!this.socket) {
      throw new Error("Signal WebSocket not connected");
    }
    let id = this.nextID++;
    signalLog(`>> ${verb} ${path}${body ? ` (${body.length}b)` : ""} id=${id}`);
    let frame = encode(WebSocketMessage, {
      type: WebSocketMessageType.Request,
      request: { verb, path, body, headers, id },
    });
    let result = new Promise<{ status: number, body?: Uint8Array, headers: string[] }>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.socket.send(frame);
    return result;
  }

  protected onFrame(bytes: Uint8Array): void {
    let msg = decode(WebSocketMessage, bytes);
    if (msg.type == WebSocketMessageType.Response && msg.response) {
      signalLog(`<< RESPONSE id=${msg.response.id} status=${msg.response.status}${msg.response.body ? ` (${msg.response.body.length}b)` : ""}`);
      let pending = this.pending.get(msg.response.id ?? 0);
      if (pending) {
        this.pending.delete(msg.response.id!);
        pending.resolve({ status: msg.response.status ?? 0, body: msg.response.body, headers: msg.response.headers ?? [] });
      }
    } else if (msg.type == WebSocketMessageType.Request && msg.request) {
      signalLog(`<< REQUEST ${msg.request.verb} ${msg.request.path}${msg.request.body ? ` (${msg.request.body.length}b)` : ""}`);
      this.dispatchRequest(msg.request).catch(() => undefined);
    } else {
      signalLog("<< unknown frame, type", msg.type);
    }
  }

  /** Handle a server-pushed request (inbound message) and ACK it. */
  protected async dispatchRequest(req: WebSocketRequestMessage): Promise<void> {
    let status = await this.onRequest(req).catch(() => 500);
    if (this.socket && req.id != null) {
      this.socket.send(encode(WebSocketMessage, {
        type: WebSocketMessageType.Response,
        response: { id: req.id, status, message: status == 200 ? "OK" : "Error", headers: [] },
      }));
    }
  }

  protected startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      this.request("GET", "/v1/keepalive").catch(() => undefined);
    }, 30_000);
    (this.keepAliveTimer as any)?.unref?.();
  }

  protected stopKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  protected handleClosed(): void {
    this.stopKeepAlive();
    for (let pending of this.pending.values()) {
      pending.reject(new Error("Signal WebSocket closed"));
    }
    this.pending.clear();
    this.socket = null;
    this.onClose?.();
  }

  disconnect(): void {
    this.stopKeepAlive();
    let socket = this.socket;
    this.socket = null;
    socket?.close();
  }

  get isConnected(): boolean {
    return !!this.socket;
  }
}
