import type { NTLMChromiumSession } from "./NTLMChromiumSession";
import { NTLMResponse, type NTLMRequestOptions } from "./NTLMTransport";
import { appGlobal } from "../../app";
import { assert } from "../../util/util";

export class NTLMChromiumStream {
  protected readonly session: NTLMChromiumSession;
  protected readonly partition: string;

  constructor(session: NTLMChromiumSession, partition: string) {
    this.session = session;
    this.partition = partition;
  }

  async request(body: string, options: NTLMRequestOptions = {}): Promise<NTLMResponse> {
    let onAbort = () => this.close();
    options.signal?.addEventListener("abort", onAbort);
    try {
      assert(!options.signal?.aborted, "Request was aborted");
      return await this.session.requestOnPartition(this.partition, body, options);
    } finally {
      options.signal?.removeEventListener("abort", onAbort);
    }
  }

  /** Closes the TCP connection, which aborts the running stream. */
  close(): void {
    appGlobal.remoteApp.closeNetConnections(this.partition).catch(console.error);
  }
}
