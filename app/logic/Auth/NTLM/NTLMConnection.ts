import { NTLMResponse, joinHeader, type NTLMRequestOptions } from "./NTLMTransport";
import type { EWSAccount } from "../../Mail/EWS/EWSAccount";
import { LoginError } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { Lock } from "../../util/flow/Lock";
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

  constructor(account: EWSAccount, cookies?: CookieJar) {
    this.account = account;
    this.cookies = cookies ?? new CookieJar();
  }

  /**
   * POSTs to the account URL over this connection, transparently
   * authenticating the TCP connection as needed.
   * @param onChunk Streams a 2xx response body instead of returning it:
   *   Called for each chunk, in order. The promise resolves once the
   *   response ended. Non-2xx responses are still returned whole.
   * @throws LoginError if the server rejected the credentials
   */
  async request(body: string, options: NTLMRequestOptions = {}): Promise<NTLMResponse> {
    let locked = await this.lock.lock();
    let onAbort = () => this.close();
    options.signal?.addEventListener("abort", onAbort);
    try {
      assert(!options.signal?.aborted, "Request was aborted");
      this.conn ??= await appGlobal.remoteApp.newHTTPConnection(this.account.url,
        { acceptBrokenTLSCerts: this.account.acceptBrokenTLSCerts });
      const kMaxAttempts = 3;
      for (let attempt = 1; attempt <= kMaxAttempts; attempt++) {
        let response = await this.requestOnce(body, options, attempt < kMaxAttempts);
        if (response) {
          return response;
        }
        // Try again, with a new NTLM handshake
      }
      throw new LoginError(null, gt`Login failed`);
    } finally {
      options.signal?.removeEventListener("abort", onAbort);
      locked.release();
    }
  }

  /** @returns the response, or null if the caller should retry */
  protected async requestOnce(body: string, options: NTLMRequestOptions, mayRetry: boolean): Promise<NTLMResponse | null> {
    try {
      let authorization: string | null = null;
      let expectedSocketID = this.authenticatedSocketID;
      if (!expectedSocketID || !await this.conn.isAlive()) {
        let challenge = await this.negotiate();
        if (challenge.type2) {
          // The login rides on the actual request, saving a round trip
          authorization = await appGlobal.remoteApp.createType3MessageFromType2Message(
            challenge.type2, this.account.username, this.account.password);
        } // else: server does not require authentication
        expectedSocketID = challenge.socketID;
      }
      let response = await this.transmit(body, authorization, options);
      if (response.socketID != expectedSocketID) {
        // The TCP connection was replaced while our request was underway,
        // so the server never saw our login on this new connection.
        this.authenticatedSocketID = 0;
        if (response.status == 401 && mayRetry) {
          return null;
        }
      } else if (response.status == 401) {
        this.authenticatedSocketID = 0;
        if (authorization) {
          // Our login on the correct connection was rejected
          throw new LoginError(null, gt`Login failed`);
        }
        if (mayRetry) {
          return null; // Server dropped the login state. Log in again.
        }
      }
      if (response.status != 401) {
        this.authenticatedSocketID = response.socketID;
      }
      return response;
    } catch (ex) {
      if (ex?.reusedSocket && kConnectionDropCodes.includes(ex.code) &&
          mayRetry && !options.signal?.aborted) {
        // Keep-alive race: The server closed the connection at the moment
        // our request went out on it, so it never received the request.
        this.authenticatedSocketID = 0;
        return null;
      }
      throw ex;
    }
  }

  /** NTLM handshake steps 1 and 2: Send Type 1, receive the server
   * challenge (Type 2). The challenge is bound to `socketID`. */
  protected async negotiate(): Promise<{ socketID: number, type2: string | null }> {
    let type1 = await appGlobal.remoteApp.createType1Message();
    let response = await this.conn.request({
      headers: this.headers(type1),
      body: "", // Server ignores the body of this step, so don't waste bandwidth
    });
    this.cookies.update(response.headers);
    if (response.status != 401) {
      return { socketID: response.socketID, type2: null };
    }
    let wwwAuthenticate = joinHeader(response.headers["www-authenticate"]);
    assert(/\bNTLM\s+[A-Za-z0-9+/=]/.test(wwwAuthenticate),
      gt`Your account is configured to use ${"NTLM"} authentication, but your server does not support it. Please change your account settings or set up the account again.`);
    return { socketID: response.socketID, type2: wwwAuthenticate };
  }

  protected async transmit(body: string, authorization: string | null, options: NTLMRequestOptions): Promise<NTLMResponse> {
    let response = await this.conn.request({
      headers: this.headers(authorization, options.headers),
      body,
    }, options.onChunk);
    this.cookies.update(response.headers);
    return new NTLMResponse(response);
  }

  protected headers(authorization: string | null, requestHeaders?: Record<string, string>): Record<string, string> {
    let headers: Record<string, string> = { ...requestHeaders };
    if (authorization) {
      headers.Authorization = authorization;
    }
    let cookie = this.cookies.header;
    if (cookie) {
      headers.Cookie = cookie;
    }
    return headers;
  }

  /** Closes the TCP connection and aborts any request underway.
   * The connection cannot be used again afterwards. */
  close(): void {
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

/** Errors where the server closed the connection without answering */
const kConnectionDropCodes = ["ECONNRESET", "EPIPE"];
