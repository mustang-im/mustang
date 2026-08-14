import { NTLMResponse, type NTLMRequestOptions } from "./NTLMResponse";
import { NTLMChromiumStream } from "./NTLMChromiumStream";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import { appGlobal } from "../../app";

/**
 * NTLM login via Chromium's network stack. Electron only.
 *
 * Chromium performs the NTLM handshake natively, on the affected TCP
 * connection, for every connection of its pool, and re-sends the request
 * after logging in. So, unlike with `fetch()`, no request surfaces a 401
 * on a connection that Chromium could authenticate first. We only supply
 * the credentials, in backend `netRequest()`.
 *
 * Counterpart of `NTLMConnectionPool`, our own implementation, which is
 * used on platforms without the Chromium `net` API, e.g. mobile.
 */
export class NTLMChromiumSession {
  protected readonly account: EWSAccount;

  constructor(account: EWSAccount) {
    this.account = account;
  }

  /** Cookies, HTTP auth state, and the pool of 6 TCP connections are
   * per partition, which isolates the accounts from each other. */
  protected get partition(): string {
    return this.account.webSessionID ?? "ntlm-setup";
  }

  async request(body: string, options?: NTLMRequestOptions): Promise<NTLMResponse> {
    return await this.requestOnPartition(this.partition, body, options ?? {});
  }

  /** Internal, also for `NTLMChromiumStream` */
  async requestOnPartition(partition: string, body: string, options: NTLMRequestOptions): Promise<NTLMResponse> {
    let response = await appGlobal.remoteApp.netRequest(this.account.url,
      { method: "POST", headers: options.headers, body },
      partition, this.account.username, this.account.password,
      options.onChunk);
    return new NTLMResponse(response);
  }

  /**
   * For a long-running notification stream: It runs on its own partition,
   * so that it does not occupy one of the 6 pooled connections of the
   * account partition, and so that `close()` aborts exactly this stream.
   * @param streamID stable per stream, e.g. the streamed account's username
   */
  newDedicatedConnection(streamID = ""): NTLMChromiumStream {
    return new NTLMChromiumStream(this, `${this.partition}:stream:${streamID}`);
  }

  closeAll(): void {
    appGlobal.remoteApp.closeNetConnections(this.partition).catch(console.error);
  }
}
