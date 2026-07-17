/** The Signal service hosts and the HTTPS REST client used for registration, keys,
 * profiles, groups, storage service and CDN. The realtime message stream uses the
 * WebSocket in SignalWebSocket.ts; everything request/response goes through here.
 * See Docs/01-transport. */
import ky, { type KyInstance, HTTPError } from "ky";
import { base64Encode } from "../Crypto/primitives";
import { signalLog } from "../util";

/** Production service hosts (libsignal `env.rs` / Signal-Android BuildConfig). */
export const SignalHosts = {
  chat: "https://chat.signal.org",
  storage: "https://storage.signal.org",
  cdn0: "https://cdn.signal.org",
  cdn2: "https://cdn2.signal.org",
  cdn3: "https://cdn3.signal.org",
  cdsi: "https://cdsi.signal.org",
  svr2: "https://svr2.signal.org",
  sfu: "https://sfu.voip.signal.org",
} as const;

/** CDN base by cdnNumber (AttachmentPointer.cdnNumber / profile avatar paths). */
export function cdnHost(cdnNumber: number): string {
  switch (cdnNumber) {
    case 0: return SignalHosts.cdn0;
    case 2: return SignalHosts.cdn2;
    case 3: return SignalHosts.cdn3;
    default: return SignalHosts.cdn2;
  }
}

export interface Credentials {
  /** ACI or E.164 (registration), with optional ".deviceId". */
  username: string;
  password: string;
}

/** Thrown for non-2xx responses, exposing the status and parsed JSON body so
 * callers can implement the 409/410/428 device-management + challenge flows. */
export class SignalHttpError extends Error {
  constructor(readonly status: number, readonly body: any, message?: string) {
    super(message ?? `Signal HTTP ${status}`);
  }
}

function authHeader(creds?: Credentials): Record<string, string> {
  if (!creds) {
    return {};
  }
  let token = base64Encode(new TextEncoder().encode(`${creds.username}:${creds.password}`));
  return { Authorization: "Basic " + token };
}

/** A thin REST client over `ky` for one service host. */
export class SignalApi {
  protected client: KyInstance;

  constructor(readonly baseURL: string = SignalHosts.chat) {
    this.client = ky.create({ prefixUrl: baseURL, throwHttpErrors: false, timeout: 30_000 });
  }

  /** GET/PUT/POST/DELETE returning parsed JSON (or `undefined` for 204). */
  async json<T = any>(method: string, path: string, body?: any, creds?: Credentials): Promise<T> {
    signalLog(`>> HTTP ${method} ${this.baseURL}/${stripLeadingSlash(path)}`);
    let res = await this.client(stripLeadingSlash(path), {
      method,
      headers: { ...authHeader(creds), ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    signalLog(`<< HTTP ${res.status} ${method} ${stripLeadingSlash(path)}`);
    return await this.parse<T>(res);
  }

  /** A GET that the server holds open until data is ready or its own timeout fires
   * (e.g. `/v1/devices/transfer_archive`). Returns the parsed JSON, or `undefined`
   * on a 204 (server-side long-poll timeout - the caller loops). `timeoutMs` must
   * exceed the server-side `?timeout=` so the client doesn't abort first. */
  async jsonLongPoll<T = any>(path: string, creds: Credentials | undefined, timeoutMs: number): Promise<T> {
    signalLog(`>> HTTP GET ${this.baseURL}/${stripLeadingSlash(path)} (long-poll ${timeoutMs}ms)`);
    let res = await this.client(stripLeadingSlash(path), {
      method: "GET",
      headers: authHeader(creds),
      timeout: timeoutMs,
    });
    signalLog(`<< HTTP ${res.status} GET ${stripLeadingSlash(path)}`);
    return await this.parse<T>(res);
  }

  /** PUT/POST raw bytes (e.g. multi-recipient messages, CDN uploads). */
  async bytes(method: string, path: string, body: Uint8Array, contentType: string, creds?: Credentials): Promise<Uint8Array> {
    signalLog(`>> HTTP ${method} ${this.baseURL}/${stripLeadingSlash(path)} (${body.length}b)`);
    let res = await this.client(stripLeadingSlash(path), {
      method,
      headers: { ...authHeader(creds), "Content-Type": contentType },
      body: body as unknown as BodyInit,
    });
    signalLog(`<< HTTP ${res.status} ${method} ${stripLeadingSlash(path)}`);
    if (!res.ok) {
      let errorBody = await safeJson(res);
      // Diagnostic: a live run's log shows exactly what the server rejected, so any
      // unconfirmed request shape (device-link username, key signatures, …) can be
      // corrected from the response body. Remove once the wire is confirmed.
      console.warn(`Signal HTTP ${res.status} ${this.baseURL} — server response:`, errorBody);
      throw new SignalHttpError(res.status, errorBody);
    }
    return new Uint8Array(await res.arrayBuffer());
  }

  /** GET raw bytes (CDN download, group avatars). */
  async getBytes(path: string, creds?: Credentials): Promise<Uint8Array> {
    signalLog(`>> HTTP GET ${this.baseURL}/${stripLeadingSlash(path)}`);
    let res = await this.client(stripLeadingSlash(path), { method: "GET", headers: authHeader(creds) });
    signalLog(`<< HTTP ${res.status} GET ${stripLeadingSlash(path)}`);
    if (!res.ok) {
      let errorBody = await safeJson(res);
      // Diagnostic: a live run's log shows exactly what the server rejected, so any
      // unconfirmed request shape (device-link username, key signatures, …) can be
      // corrected from the response body. Remove once the wire is confirmed.
      console.warn(`Signal HTTP ${res.status} ${this.baseURL} — server response:`, errorBody);
      throw new SignalHttpError(res.status, errorBody);
    }
    return new Uint8Array(await res.arrayBuffer());
  }

  protected async parse<T>(res: Response): Promise<T> {
    if (res.status == 204) {
      return undefined as T;
    }
    if (!res.ok) {
      let errorBody = await safeJson(res);
      // Diagnostic: a live run's log shows exactly what the server rejected, so any
      // unconfirmed request shape (device-link username, key signatures, …) can be
      // corrected from the response body. Remove once the wire is confirmed.
      console.warn(`Signal HTTP ${res.status} ${this.baseURL} — server response:`, errorBody);
      throw new SignalHttpError(res.status, errorBody);
    }
    return (await safeJson(res)) as T;
  }
}

function stripLeadingSlash(path: string): string {
  return path.startsWith("/") ? path.slice(1) : path;
}

async function safeJson(res: Response): Promise<any> {
  try {
    let text = await res.text();
    return text ? JSON.parse(text) : undefined;
  } catch (ex) {
    return undefined;
  }
}

export { HTTPError };
