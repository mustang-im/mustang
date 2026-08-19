import { NTLMConnection, CookieJar } from "./NTLMConnection";
import type { NTLMRequestOptions, NTLMResponse } from "./NTLMResponse";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import { Semaphore } from "../../util/flow/Semaphore";
import { arrayRemove } from "../../util/util";

/**
 * Runs parallel requests to an NTLM server over a set of `NTLMConnection`s.
 *
 * Each connection authenticates its own TCP connection independently, so
 * correctness never depends on the pool: Any request may run on any
 * connection. The pool size only tunes parallelism.
 *
 * All connections use a specific cookie jar, so if a load-balancer adds cookies
 * for recording the server affinity, they behave like in a browser.
 * The caller controls which cookie jar is used, so we can separate accounts.
 */
export class NTLMConnectionPool {
  protected readonly account: EWSAccount;
  readonly cookies: CookieJar;
  protected readonly free: NTLMConnection[] = [];
  protected readonly all: NTLMConnection[] = [];
  protected readonly semaphore: Semaphore;

  constructor(account: EWSAccount, cookies = new CookieJar(), maxConnections = 6) {
    this.account = account;
    this.cookies = cookies;
    this.semaphore = new Semaphore(maxConnections);
  }

  /** POSTs to the account URL, over the first free connection,
   * waiting for one if all are busy. */
  async request(body: string, options?: NTLMRequestOptions): Promise<NTLMResponse> {
    let locked = await this.semaphore.lock();
    let conn = this.free.pop();
    if (!conn) {
      conn = new NTLMConnection(this.account, this.cookies);
      this.all.push(conn);
    }
    try {
      let response = await conn.request(body, options);
      if (this.all.includes(conn)) {
        this.free.push(conn);
      } else { // the pool was closed while we were running
        conn.close();
      }
      return response;
    } catch (ex) {
      // Don't reuse the connection: it may be in an odd state, and
      // a fresh connection re-authenticates cleanly.
      this.remove(conn);
      throw ex;
    } finally {
      locked.release();
    }
  }

  /**
   * A connection outside of the pool, e.g. for a long-running
   * notification stream, which would otherwise hog a pool slot.
   * `close()` it when done. It shares the pool's cookie jar.
   * @param _streamID only `NTLMChromiumSession` needs it
   */
  newDedicatedConnection(_streamID?: string): NTLMConnection {
    return new NTLMConnection(this.account, this.cookies);
  }

  protected remove(conn: NTLMConnection): void {
    conn.close();
    arrayRemove(this.all, conn);
  }

  /** Closes all TCP connections, e.g. on logout.
   * The pool can still be used afterwards and would reconnect. */
  close(): void {
    for (let conn of this.all) {
      conn.close();
    }
    this.all.length = 0;
    this.free.length = 0;
  }
}
