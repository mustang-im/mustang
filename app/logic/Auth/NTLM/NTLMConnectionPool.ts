import { NTLMConnection, CookieJar, type NTLMServer, type NTLMRequestOptions, type NTLMResponse } from "./NTLMConnection";
import { Semaphore } from "../../util/flow/Semaphore";

/**
 * Runs parallel requests to an NTLM server over a set of `NTLMConnection`s.
 *
 * Each connection authenticates its own TCP connection independently, so
 * correctness never depends on the pool: Any request may run on any
 * connection. The pool size only tunes parallelism.
 *
 * All connections share one cookie jar, so load-balancer affinity cookies
 * behave like in a browser.
 */
export class NTLMConnectionPool {
  protected readonly account: NTLMServer;
  readonly cookies = new CookieJar();
  protected readonly free: NTLMConnection[] = [];
  protected readonly all: NTLMConnection[] = [];
  protected readonly semaphore: Semaphore;

  constructor(account: NTLMServer, maxConnections = 6) {
    this.account = account;
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
      this.free.push(conn);
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
   */
  newDedicatedConnection(): NTLMConnection {
    return new NTLMConnection(this.account, this.cookies);
  }

  protected remove(conn: NTLMConnection): void {
    conn.close();
    let pos = this.all.indexOf(conn);
    if (pos >= 0) {
      this.all.splice(pos, 1);
    }
  }

  /** Closes all TCP connections, e.g. on logout.
   * The pool can still be used afterwards and would reconnect. */
  closeAll(): void {
    for (let conn of this.all) {
      conn.close();
    }
    this.all.length = 0;
    this.free.length = 0;
  }
}
