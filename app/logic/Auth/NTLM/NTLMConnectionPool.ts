import { NTLMConnection, CookieJar } from "./NTLMConnection";
import type { NTLMRequestOptions, NTLMResponse } from "./NTLMResponse";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import { ConnectionPurpose } from "../../Mail/EWS/ConnectionPurpose";
import { Lock } from "../../util/flow/Lock";
import { Semaphore } from "../../util/flow/Semaphore";
import { arrayRemove } from "../../util/util";

/**
 * Runs parallel requests to an NTLM server over a set of `NTLMConnection`s.
 *
 * Each connection authenticates its own TCP connection independently, so
 * correctness never depends on the pool: Any request may run on any
 * connection, whatever it was used for before.
 *
 * All connections use a specific cookie jar, so if a load-balancer adds cookies
 * for recording the server affinity, they behave like in a browser.
 * The caller controls which cookie jar is used, so we can separate accounts.
 */
export class NTLMConnectionPool {
  protected readonly account: EWSAccount;
  readonly cookies: CookieJar;
  /** Logged in, and not currently running a request */
  protected readonly free: NTLMConnection[] = [];
  protected readonly all: NTLMConnection[] = [];
  protected readonly handshakeLock = new Lock();
  /** Connection pool: 2 interactive, 2 background fetch, plus
   * 1 stream per account on server */
  protected readonly semaphores = new Map<ConnectionPurpose, Semaphore>([
    [ConnectionPurpose.Fetch, new Semaphore(2)],
    [ConnectionPurpose.Display, new Semaphore(2)],
  ]);

  static _nextID = 1;
  /** Only for the log */
  readonly id = NTLMConnectionPool._nextID++;

  constructor(account: EWSAccount, cookies = new CookieJar()) {
    this.account = account;
    this.cookies = cookies;
    console.log(`NTLM pool ${this.id}: Created`);
  }

  /** DEBUG */
  protected get status(): string {
    let fetch = this.semaphores.get(ConnectionPurpose.Fetch);
    let display = this.semaphores.get(ConnectionPurpose.Display);
    return `${this.free.length} free of ${this.all.length} connections [${this.all.map(conn => conn.id).join(",")}], Fetch ${fetch.countRunning} running + ${fetch.countWaiting} waiting, Display ${display.countRunning} running + ${display.countWaiting} waiting`;
  }

  /** POSTs to the account URL, over the first free connection */
  async request(body: string, options: NTLMRequestOptions = {}): Promise<NTLMResponse> {
    let purpose = options.purpose ?? ConnectionPurpose.Display;
    let startTime = Date.now();
    let semaphore = this.semaphores.get(purpose);
    if (semaphore.needToWait) {
      console.log(`NTLM pool ${this.id} ${options.name ?? "request"}: Queued for a ${purpose} slot: ${this.status}`);
    }
    let locked = await semaphore.lock();
    if (locked.wasWaiting) {
      console.log(`NTLM pool ${this.id} ${options.name ?? "request"}: Waited ${Date.now() - startTime} ms for a free ${purpose} slot`);
    }
    let conn = this.free.pop();
    if (!conn) {
      conn = new NTLMConnection(this.account, this.cookies, this.handshakeLock);
      this.all.push(conn);
      console.log(`NTLM pool ${this.id} ${options.name ?? "request"}: New connection #${conn.id} for ${purpose}: ${this.status}`);
    } else {
      console.log(`NTLM pool ${this.id} ${options.name ?? "request"}: Reusing connection #${conn.id} for ${purpose}: ${this.status}`);
    }
    try {
      let response = await conn.request(body, options);
      if (this.all.includes(conn)) {
        this.free.push(conn);
      } else { // the pool was closed while we were running
        console.log(`NTLM pool ${this.id} ${options.name ?? "request"}: Pool was closed during the request, closing #${conn.id}`);
        conn.close();
      }
      console.log(`NTLM pool ${this.id} ${options.name ?? "request"}: Done on #${conn.id} after ${Date.now() - startTime} ms incl. queue`);
      return response;
    } catch (ex) {
      // Don't reuse the connection: it may be in an odd state, and
      // a fresh connection re-authenticates cleanly.
      console.log(`NTLM pool ${this.id} ${options.name ?? "request"}: Dropping #${conn.id} after ${Date.now() - startTime} ms incl. queue, because of ${ex?.code ?? ex?.message}`);
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
    let conn = new NTLMConnection(this.account, this.cookies, this.handshakeLock);
    console.log(`NTLM pool ${this.id}: Dedicated connection #${conn.id} for a stream`);
    return conn;
  }

  protected remove(conn: NTLMConnection): void {
    conn.close();
    arrayRemove(this.all, conn);
  }

  /** Closes all TCP connections, e.g. on logout.
   * The pool can still be used afterwards and would reconnect. */
  close(): void {
    console.log(`NTLM pool ${this.id}: close(): ${this.status}`);
    for (let conn of this.all) {
      conn.close();
    }
    this.all.length = 0;
    this.free.length = 0;
  }
}
