import { NTLMConnectionPool } from "./NTLMConnectionPool";
import { NTLMChromiumSession } from "./NTLMChromium";
import { appGlobal } from "../../app";

/**
 * The common contract of our two alternative NTLM implementations:
 * - `NTLMChromiumSession`: Chromium's network stack does the NTLM login
 * - `NTLMConnectionPool`: our own NTLM implementation, over `HTTPConnection`
 */
export interface NTLMTransport {
  request(body: string, options?: NTLMRequestOptions): Promise<NTLMResponse>;
  /** For a long-running notification stream, outside of the pool.
   * @param streamID stable per stream, e.g. the streamed account's username */
  newDedicatedConnection(streamID?: string): NTLMTransportConnection;
  /** Closes all TCP connections, e.g. on logout.
   * The transport can still be used afterwards and would reconnect. */
  closeAll(): void;
}

export interface NTLMTransportConnection {
  request(body: string, options?: NTLMRequestOptions): Promise<NTLMResponse>;
  close(): void;
}

/** The subset of `Account` that the NTLM login needs. Read live, so that
 * a changed password is picked up on the next login. */
export interface NTLMServer {
  url: string;
  username: string;
  password: string;
  acceptBrokenTLSCerts: boolean;
  /** Isolates the accounts from each other. @see `NTLMChromiumSession` */
  webSessionID: string | null;
  /** User setting: Use our own NTLM implementation (`NTLMConnectionPool`)
   * even where Chromium's network stack is available */
  useOwnNTLM: boolean;
}

export interface NTLMRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  onChunk?: (chunk: string) => Promise<void>;
}

/** Duck-typed like a `fetch()` `Response`, as far as `EWSAccount` needs it */
export class NTLMResponse {
  readonly status: number;
  readonly statusText: string;
  readonly ok: boolean;
  readonly socketID: number;
  readonly headers: { get: (name: string) => string | null };
  protected readonly bodyText: string;

  constructor(response: any) {
    this.status = response.status;
    this.statusText = response.statusText;
    this.ok = response.ok;
    this.socketID = response.socketID;
    this.bodyText = response.body;
    let rawHeaders = response.headers;
    this.headers = {
      get: (name: string) => joinHeader(rawHeaders[name.toLowerCase()]) || null,
    };
  }

  async text(): Promise<string> {
    return this.bodyText;
  }
}

/** node gives repeated HTTP headers as an array */
export function joinHeader(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value.join(", ") : value ?? "";
}

/**
 * Creates the right NTLM implementation for the account:
 * Chromium's network stack handles NTLM per TCP connection natively.
 * Where the Chromium `net` API is not available (e.g. mobile), or if the
 * user asked for it, use our own implementation.
 */
export function newNTLMTransport(account: NTLMServer): NTLMTransport {
  return appGlobal.remoteApp.netRequest && !account.useOwnNTLM
    ? new NTLMChromiumSession(account)
    : new NTLMConnectionPool(account);
}
