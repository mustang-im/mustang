import { readBodyText } from "./httpBody";
import { session as Session, net as Net } from "electron";
import type { Readable } from "node:stream";

/** Electron's type misses that its `IncomingMessage` is a node `Readable` */
type IncomingBody = Electron.IncomingMessage & Readable;

/**
 * A HTTP request through Chromium's network stack, with HTTP authentication.
 *
 * Chromium performs the NTLM (or Negotiate) login natively when the server
 * demands it: It answers the challenge on the very TCP connection that it
 * then re-sends the request on, for every connection of its pool. That is
 * the property that `fetch()` cannot give us, because NTLM authenticates
 * the TCP connection, not the HTTP request. We only supply the credentials.
 *
 * @param options `method` (default POST), `headers`, `body`
 * @param partition Scopes the cookies, the HTTP auth state, and the pool
 *   of 6 TCP connections. Use one partition per account, and a separate
 *   partition per long-running stream, so that the streams don't occupy
 *   the pool. @see `closeNetConnections()`
 * @param onChunk If given, a 2xx response body is streamed: `onChunk` is
 *   awaited for each chunk, `body` stays empty, and the promise resolves
 *   only once the stream ended. Non-2xx responses are returned whole.
 */
export async function netRequest(url: string, options: any, partition: string,
    username: string, password: string,
    onChunk?: (chunk: string) => Promise<void>): Promise<NetResponse> {
  let request = Net.request({
    url,
    method: options?.method ?? "POST",
    headers: options?.headers,
    partition,
    credentials: "include", // send cookies, and engage the HTTP auth stack
  });
  /** The response body, once it started to arrive, so that `abort()` ends it */
  let responseStream: IncomingBody | null = null;
  let abort = () => {
    // Ends the body stream, so that a running `readBodyText()` finishes
    responseStream?.destroy(new Error(kAborted));
    request.abort();
  };
  let partitionRequests = inFlight.get(partition) ?? new Set<() => void>();
  inFlight.set(partition, partitionRequests);
  partitionRequests.add(abort);
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
          callback(username, password);
        }
      });
      request.on("response", response => {
        responseStream = response as IncomingBody;
        resolve(responseStream);
      });
      request.on("abort", () => reject(new Error(kAborted)));
      request.on("error", reject);
      request.end(options?.body ?? "");
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
    partitionRequests.delete(abort);
  }
}

/** Aborts all running `netRequest()`s of the given partition, e.g. a
 * notification stream, and closes all of its TCP connections. */
export async function closeNetConnections(partition: string): Promise<void> {
  for (let abort of inFlight.get(partition) ?? []) {
    abort();
  }
  await Session.fromPartition(partition).closeAllConnections();
}

/** Aborts the in-flight requests of a partition, @see `closeNetConnections()` */
const inFlight = new Map<string, Set<() => void>>();

const kAborted = "net::ERR_ABORTED by closeNetConnections()";

export interface NetResponse {
  status: number;
  statusText: string;
  ok: boolean;
  /** Lowercase header names. Repeated headers are a string array. */
  headers: Record<string, string | string[]>;
  body: string;
}
