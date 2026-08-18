import { NTLMResponse, type NTLMRequestOptions } from "./NTLMResponse";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import { appGlobal } from "../../app";

/**
 * NTLM login via Chromium's network stack. Electron only.
 *
 * Chromium performs the NTLM handshake natively, on the affected TCP
 * connection, for every connection of its pool, and re-sends the request
 * after logging in. So, unlike with `fetch()`, no request surfaces a 401
 * on a connection that Chromium could authenticate first. We only supply
 * the credentials, in backend `NetSession`.
 *
 * Counterpart of `NTLMConnectionPool`, our own implementation, which is
 * used on platforms without the Chromium `net` API, e.g. mobile.
 */
export class NTLMChromiumSession {
  protected readonly account: EWSAccount;
  /** Backend `NetSession` (via JPC).
   * Keep the Promise here to avoid race conditions initialising it. */
  protected conn: Promise<any>;

  constructor(account: EWSAccount, streamID: string | null = null) {
    this.account = account;
    /** Cookies, HTTP auth state, and the pool of 6 TCP connections are per
     * partition, which isolates the accounts and streams from each other. */
    let partition = this.account.webSessionID ?? "ntlm-setup";
    if (streamID) {
      partition = `${partition}:stream:${streamID}`;
    }
    this.conn = appGlobal.remoteApp.newNetSession(this.account.url,
      partition, this.account.username, this.account.password);
  }

  async request(body: string, options: NTLMRequestOptions = {}): Promise<NTLMResponse> {
    let response = await (await this.conn).request({ headers: options.headers, body }, options.onChunk);
    return new NTLMResponse(response);
  }

  /**
   * A connection outside of the pool, e.g. for a long-running notification
   * stream: It runs on its own partition, so that it does not occupy one of
   * the 6 pooled connections of the account, and so that `close()` aborts
   * exactly this stream.
   * @param streamID stable per stream, e.g. the streamed account's username
   */
  newDedicatedConnection(streamID = ""): NTLMChromiumSession {
    return new NTLMChromiumSession(this.account, streamID);
  }

  /** Closes the TCP connections, which aborts the requests running on them.
   * More requests would open new connections. */
  close(): void {
    this.conn?.close().catch(console.error);
    this.conn = null;
  }
}
