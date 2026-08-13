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
  let tracked = {} as TrackedRequest;
  let partitionRequests = inFlight.get(partition) ?? new Set();
  inFlight.set(partition, partitionRequests);
  partitionRequests.add(tracked);
  try {
    let message: IncomingBody = await new Promise((resolve, reject) => {
      let request = Net.request({
        url,
        method: options?.method ?? "POST",
        headers: options?.headers,
        partition,
        credentials: "include", // send cookies, and engage the HTTP auth stack
      });
      tracked.request = request;
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
      request.on("response", message => resolve(message as IncomingBody));
      request.on("abort", () => reject(new Error("net::ERR_ABORTED by closeNetConnections()")));
      request.on("error", reject);
      request.end(options?.body ?? "");
    });
    tracked.message = message;
    return await readResponse(message, onChunk);
  } finally {
    partitionRequests.delete(tracked);
  }
}

interface TrackedRequest {
  request: Electron.ClientRequest;
  message?: IncomingBody;
}

/** In-flight requests per partition, so that `closeNetConnections()`
 * can abort them, e.g. a 29-minutes notification stream */
const inFlight = new Map<string, Set<TrackedRequest>>();

async function readResponse(message: IncomingBody,
    onChunk?: (chunk: string) => Promise<void>): Promise<NetResponse> {
  let status = message.statusCode;
  let response: NetResponse = {
    status,
    statusText: message.statusMessage,
    ok: status >= 200 && status <= 299,
    headers: message.headers,
    body: "",
  };
  if ([204, 205, 304].includes(status)) { // no response body, by spec
    return response;
  }
  let decoder = new TextDecoder(); // Exchange and friends are always UTF-8
  if (onChunk && response.ok) {
    for await (let chunk of message) {
      let text = decoder.decode(chunk as Buffer, { stream: true });
      if (text) {
        await onChunk(text); // await = backpressure: process in order
      }
    }
    let tail = decoder.decode(); // flush a split multi-byte char, if any
    if (tail) {
      await onChunk(tail);
    }
  } else {
    let chunks: Buffer[] = [];
    for await (let chunk of message) {
      chunks.push(chunk as Buffer);
    }
    response.body = decoder.decode(Buffer.concat(chunks));
  }
  return response;
}

/** Aborts all running `netRequest()`s of the given partition, e.g. a
 * notification stream, and closes all of its TCP connections. */
export async function closeNetConnections(partition: string): Promise<void> {
  for (let tracked of inFlight.get(partition) ?? []) {
    // Ends the body stream, so that a running `readResponse()` finishes
    tracked.message?.destroy(new Error("net::ERR_ABORTED by closeNetConnections()"));
    tracked.request?.abort();
  }
  await Session.fromPartition(partition).closeAllConnections();
}

export interface NetResponse {
  status: number;
  statusText: string;
  ok: boolean;
  /** Lowercase header names. Repeated headers are a string array. */
  headers: Record<string, string | string[]>;
  body: string;
}
