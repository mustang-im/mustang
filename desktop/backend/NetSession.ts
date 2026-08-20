import { readBodyText } from "./httpBody";
import { session as Session, net as Net } from "electron";
import type { Readable } from "node:stream";

/** Electron's type misses that its `IncomingMessage` is a node `Readable` */
type IncomingBody = Electron.IncomingMessage & Readable;

/**
 * HTTP requests through Chromium's network stack, with HTTP authentication.
 *
 * Chromium performs the NTLM (or Negotiate) login natively when the server
 * demands it: It answers the challenge on the very TCP connection that it
 * then re-sends the request on, for every connection of its pool. That is
 * the property that `fetch()` cannot give us, because NTLM authenticates
 * the TCP connection, not the HTTP request. We only supply the credentials.
 *
 * One object = one Chromium partition, which scopes the cookies, the HTTP
 * auth state, and the pool of 6 TCP connections.
 *
 * This is only the transport. Which partition to use, and when to close it,
 * is decided by the caller in app/logic, see `NTLMChromiumSession`.
 */
export class NetSession {
  protected readonly url: string;
  protected readonly session: Electron.Session;
  protected readonly username: string;
  protected readonly password: string;
  /** Aborts the requests that are underway, so that `close()` can end them */
  protected readonly inFlight = new Set<() => void>();

  constructor(url: string, partition: string, username: string, password: string) {
    this.url = url;
    this.session = Session.fromPartition(partition);
    this.username = username;
    this.password = password;
  }

  /**
   * @param onChunk If given, a 2xx response body is streamed: `onChunk` is
   *   awaited for each chunk, `body` stays empty, and the promise resolves
   *   only once the stream ended. Non-2xx responses are returned whole.
   */
  async request(options: {
    method?: string,
    headers?: Record<string, string>,
    body?: string,
  }, onChunk?: (chunk: string) => Promise<void>): Promise<NetResponse> {
    let headers = onChunk
      // Compressing a stream delays the chunks in the compressor
      ? { ...options.headers, "Accept-Encoding": "identity" }
      : options.headers;
    let request = Net.request({
      url: this.url,
      method: options.method ?? "POST",
      headers,
      session: this.session,
      credentials: "include", // send cookies, and engage the HTTP auth stack
    });
    /** The response body, once it started to arrive, so that `abort()` ends it */
    let responseStream: IncomingBody | null = null;
    let abort = () => {
      // Ends the body stream, so that a running `readBodyText()` finishes
      responseStream?.destroy(new Error(kAborted));
      request.abort();
    };
    this.inFlight.add(abort);
    try {
      let message = await new Promise<IncomingBody>((resolve, reject) => {
        let loginAttempted = false;
        request.on("login", (authInfo, callback) => {
          if (authInfo.isProxy || loginAttempted) {
            /* Supply the credentials at most once per request: Retrying rejected
             * credentials can lock out the user's Windows account.
             * Cancel instead, which surfaces the 401 to the caller. */
            callback();
          } else {
            loginAttempted = true;
            callback(this.username, this.password);
          }
        });
        request.on("response", response => {
          responseStream = response as IncomingBody;
          resolve(responseStream);
        });
        request.on("abort", () => reject(new Error(kAborted)));
        request.on("error", reject);
        request.end(options.body ?? "");
      });
      let status = message.statusCode;
      let ok = status >= 200 && status <= 299;
      return {
        status,
        statusText: message.statusMessage,
        ok,
        headers: message.headers,
        // Non-2xx responses are returned whole, e.g. an auth challenge
        body: await readBodyText(message, ok ? onChunk : undefined),
      };
    } finally {
      this.inFlight.delete(abort);
    }
  }

  /** Aborts the requests that are underway, e.g. a notification stream, and
   * closes all TCP connections. Later requests would open new connections. */
  async close(): Promise<void> {
    for (let abort of this.inFlight) {
      abort();
    }
    await this.session.closeAllConnections();
  }
}

const kAborted = "net::ERR_ABORTED by NetSession.close()";

export interface NetResponse {
  status: number;
  statusText: string;
  ok: boolean;
  /** Lowercase header names. Repeated headers are a string array. */
  headers: Record<string, string | string[]>;
  body: string;
}
