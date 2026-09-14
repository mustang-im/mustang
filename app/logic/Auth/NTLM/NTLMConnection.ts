import { NTLMResponse, joinHeader, type NTLMRequestOptions } from "./NTLMResponse";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import { LoginError } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { retryOnTransientError } from "../../util/netUtil";
import { Lock } from "../../util/flow/Lock";
import { Timeout } from "../../util/flow/Timeout";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";

/**
 * A single HTTP connection to a server that uses NTLM authentication.
 *
 * NTLM authenticates the TCP connection, not the HTTP request:
 * 1. We send a Type 1 (negotiate) message and get a 401 with the
 *    Type 2 message (server challenge) back.
 * 2. We answer the challenge with a Type 3 (login) message, which rides
 *    on the first real request. So a fresh connection costs exactly one
 *    extra round trip.
 * 3. All later requests on the same TCP connection are authenticated
 *    without any `Authorization` header.
 *
 * Both handshake steps and all later requests must run on the same
 * TCP connection. The backend `HTTPConnection` guarantees a single
 * connection and reports which connection served each response
 * (`socketID`), so we always *know* whether our login applies, instead
 * of guessing. Whenever the server closed the connection and a request
 * ran on a new one, we see the changed `socketID` and re-authenticate.
 *
 * One request at a time per connection. For parallel requests, use
 * multiple connections, see `NTLMConnectionPool`.
 */
export class NTLMConnection {
  protected readonly account: EWSAccount;
  protected readonly cookies: CookieJar;
  /** Backend `HTTPConnection` (via JPC) */
  protected conn: any = null;
  /** `socketID` of the TCP connection that we logged in to. 0 = none. */
  protected authenticatedSocketID = 0;
  protected readonly lock = new Lock();
  /** from `NTLMConnectionPool` */
  protected readonly handshakeLock: Lock;
  static _nextID = 1;
  /** Only for the log */
  readonly id = NTLMConnection._nextID++;
  /** DEBUG: The backend logs via this. Held here, because JPC holds it only weakly. */
  protected readonly log = (message: string) => console.log(`NTLM #${this.id} ${message}`);

  constructor(account: EWSAccount, cookies?: CookieJar, handshakeLock?: Lock) {
    this.account = account;
    this.cookies = cookies ?? new CookieJar();
    this.handshakeLock = handshakeLock ?? new Lock();
  }

  /**
   * POSTs to the account URL over this connection, transparently
   * authenticating the TCP connection as needed.
   * To abort a request, `close()` the connection.
   * @param onChunk Streams a 2xx response body instead of returning it:
   *   Called for each chunk, in order. The promise resolves once the
   *   response ended. Non-2xx responses are still returned whole.
   * @throws LoginError if the server rejected the credentials
   */
  async request(body: string, options: NTLMRequestOptions = {}): Promise<NTLMResponse> {
    let startTime = Date.now();
    let locked = await this.lock.lock();
    if (locked.wasWaiting) {
      console.log(`NTLM #${this.id} ${options.name ?? "request"}: Waited ${Date.now() - startTime} ms for the previous request on this connection`);
    }
    try {
      if (!this.conn) {
        let createTime = Date.now();
        this.conn = await appGlobal.remoteApp.newHTTPConnection(this.account.url,
          { acceptBrokenTLSCerts: this.account.acceptBrokenTLSCerts, log: this.log });
        console.log(`NTLM #${this.id}: Created backend HTTPConnection in ${Date.now() - createTime} ms`);
      }
      // The login can fail for transient reasons, e.g. the server closed the
      // connection during the handshake. Then log in again and repeat, once.
      let response = await this.requestOnce(body, options, true);
      if (!response) {
        console.log(`NTLM #${this.id} ${options.name ?? "request"}: Repeating the request, after ${Date.now() - startTime} ms`);
        response = await this.requestOnce(body, options, false);
      }
      return response;
    } finally {
      locked.release();
    }
  }

  /** @param mayRetry whether the caller will repeat the request
   * @returns the response, or null if the caller should retry */
  protected async requestOnce(body: string, options: NTLMRequestOptions, mayRetry: boolean): Promise<NTLMResponse | null> {
    try {
      let authorization: string | null = null;
      let loggedInSocketID = this.authenticatedSocketID;
      let aliveTime = Date.now();
      let isAlive = !!loggedInSocketID && await this.conn.isAlive();
      if (loggedInSocketID) {
        console.log(`NTLM #${this.id} ${options.name ?? "request"}: Logged in on socket ${loggedInSocketID}, isAlive() ${isAlive} after ${Date.now() - aliveTime} ms`);
      }
      if (!isAlive) {
        let negotiateTime = Date.now();
        let challenge = await this.negotiate(options.name);
        if (challenge.type2) {
          // The login rides on the actual request, saving a round trip
          let type3Time = Date.now();
          authorization = await appGlobal.remoteApp.createType3MessageFromType2Message(
            challenge.type2, this.account.username, this.account.password);
          console.log(`NTLM #${this.id} ${options.name ?? "request"}: Handshake done after ${Date.now() - negotiateTime} ms, Type 3 took ${Date.now() - type3Time} ms, sending the request with the login on socket ${challenge.socketID}`);
        } else {
          console.log(`NTLM #${this.id} ${options.name ?? "request"}: Server needs no login, after ${Date.now() - negotiateTime} ms`);
        }
        loggedInSocketID = challenge.socketID;
      }
      let response = new NTLMResponse(await this.send(authorization, body, options));
      if (response.status != 401) {
        this.authenticatedSocketID = response.socketID;
        return response;
      }
      this.authenticatedSocketID = 0;
      console.log(`NTLM #${this.id} ${options.name ?? "request"}: HTTP 401 on socket ${response.socketID}, logged in on socket ${loggedInSocketID}, ${authorization ? "with" : "without"} login in this request, may retry: ${mayRetry}`);
      if (authorization && response.socketID == loggedInSocketID) {
        // The server rejected the login that we just made on this very connection
        throw new LoginError(null, gt`Login failed`);
      }
      // Either the server dropped our login state, or the TCP connection was
      // replaced while our request was underway, so the server never saw our
      // login on this new connection. Either way: Log in again.
      return mayRetry ? null : response;
    } catch (ex) {
      if (mayRetry && ex?.reusedSocket && !ex.responseStarted &&
          kConnectionDropCodes.includes(ex.code)) {
        // Keep-alive race: The server closed the connection at the moment
        // our request went out on it, so it never received the request.
        // Only then may we repeat it. Once the server started to answer, it
        // processed the request, and repeating it would run it a second time,
        // e.g. send the same mail twice.
        console.log(`NTLM #${this.id} ${options.name ?? "request"}: ${ex.code} on the kept-alive socket before any response, will repeat`);
        this.authenticatedSocketID = 0;
        return null;
      }
      console.log(`NTLM #${this.id} ${options.name ?? "request"}: Failed: ${ex?.code ?? ""} ${ex?.message}, reused socket: ${ex?.reusedSocket}, response started: ${ex?.responseStarted}`);
      throw ex;
    }
  }

  /** NTLM handshake steps 1 and 2: Send Type 1, receive the server
   * challenge (Type 2). The challenge is bound to `socketID`. */
  protected async negotiate(name?: string): Promise<{ socketID: number, type2: string | null }> {
    let type1 = await appGlobal.remoteApp.createType1Message();
    let attempt = 0;
    // Server ignores the body of this step, so don't waste bandwidth
    // A VPN tunnel needs some time after computer woke up, can cause errors "before secure TLS connection"
    let response = await retryOnTransientError(async () => {
      // Some servers and VPN gateways drop connections when multiple are established at the same time.
      let startTime = Date.now();
      attempt++;
      let locked = await this.handshakeLock.lock();
      if (locked.wasWaiting) {
        console.log(`NTLM #${this.id} ${name ?? "request"}: Waited ${Date.now() - startTime} ms for the handshakes of other connections`);
      }
      let timeout = new Timeout(11, () => {
        console.log(`NTLM #${this.id} ${name ?? "request"}: Handshake hangs for 11 s, letting other connections do theirs`);
        locked.release();
      });
      try {
        return await this.send(type1, "", { timeoutSec: 10, name: `${name ?? "request"} handshake attempt ${attempt}` });
      } finally {
        timeout.fulfilled();
        locked.release();
      }
    }, 3, 8);
    if (response.status != 401) {
      return { socketID: response.socketID, type2: null };
    }
    let wwwAuthenticate = joinHeader(response.headers["www-authenticate"]);
    assert(/\bNTLM\s+[A-Za-z0-9+/=]/.test(wwwAuthenticate),
      gt`Your account is configured to use ${"NTLM"} authentication, but your server does not support it. Please change your account settings or set up the account again.`);
    return { socketID: response.socketID, type2: wwwAuthenticate };
  }

  /** Sends one HTTP request over the TCP connection, with our cookies,
   * and remembers the cookies that the server sets.
   * @returns the response, as the backend returned it over JPC */
  protected async send(authorization: string | null, body: string, options: NTLMRequestOptions = {}): Promise<any> {
    let headers: Record<string, string> = { ...options.headers };
    if (authorization) {
      headers.Authorization = authorization;
    }
    let cookie = this.cookies.header;
    if (cookie) {
      headers.Cookie = cookie;
    }
    let startTime = Date.now();
    let result: string;
    try {
      let response = await this.conn.request({
        headers,
        body,
        timeoutSec: options.timeoutSec,
      }, options.onChunk);
      this.cookies.update(response.headers);
      result = `HTTP ${response.status}, ${response.body.length} bytes, socket ${response.socketID}${response.reusedSocket ? "" : " new"}`;
      return response;
    } catch (ex) {
      result = `${ex?.code ?? ex?.message}${ex?.reusedSocket ? " on the kept-alive socket" : ""}`;
      throw ex;
    } finally {
      console.log(`NTLM #${this.id} ${options.name ?? "request"}: ${Date.now() - startTime} ms, ${result}`);
    }
  }

  /** Closes the TCP connection and aborts any request underway.
   * The connection cannot be used again afterwards. */
  close(): void {
    console.log(`NTLM #${this.id}: close()${this.conn ? "" : ", had no backend connection"}`);
    this.authenticatedSocketID = 0;
    this.conn?.close().catch(console.error);
  }
}

/**
 * Remembers the cookies that the server set, and sends them back.
 * Exchange and load balancers in front of it use cookies for routing
 * affinity, e.g. `X-BackEndCookie` or ISA/TMG session cookies.
 * Deliberately minimal: One server only, session lifetime only.
 */
export class CookieJar {
  protected cookies = new Map<string, string>();

  update(responseHeaders: Record<string, string | string[]>): void {
    let setCookies = responseHeaders["set-cookie"];
    if (!setCookies) {
      return;
    }
    for (let setCookie of Array.isArray(setCookies) ? setCookies : [setCookies]) {
      let cookie = setCookie.split(";")[0];
      let pos = cookie.indexOf("=");
      if (pos <= 0) {
        continue;
      }
      this.cookies.set(cookie.slice(0, pos).trim(), cookie.slice(pos + 1).trim());
    }
  }

  get header(): string {
    return [...this.cookies].map(([name, value]) => `${name}=${value}`).join("; ");
  }
}

/** Errors where the server closed the connection without answering.
 * Deliberately narrower than `isNetworkError()`: Only these prove that the
 * server did not process the request, so only these allow a repeat. */
const kConnectionDropCodes = ["ECONNRESET", "EPIPE"];
