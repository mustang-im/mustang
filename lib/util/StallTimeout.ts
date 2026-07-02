/**
 * Aborts an HTTP request when the server stops sending data for `timeout` ms.
 *
 * ky's own `timeout` option covers only the time until the response headers
 * arrive. Reading the response body has no timeout in ky, so a connection that
 * breaks mid-response hangs forever - and with it e.g. the mail sync and
 * everything that waits for its lock. #1252
 *
 * The clock starts when the response headers arrive, and restarts whenever
 * response data arrives, so slow but working downloads are not aborted.
 *
 * Usage:
 * ```js
 * let stall = new StallTimeout(timeout, url);
 * try {
 *   return await ky.get(url, stall.wrapOptions(options)).json();
 * } finally {
 *   stall.stop();
 * }
 * ```
 */
export class StallTimeout {
  readonly timeout: number;
  protected readonly url: string;
  protected readonly controller = new AbortController();
  protected timer: ReturnType<typeof setTimeout> | undefined;

  /** @param timeout in ms. Falsy = disabled */
  constructor(timeout: number, url: string) {
    this.timeout = timeout;
    this.url = url;
  }

  /** Adds the abort signal and the observers for response data to the ky request options */
  wrapOptions(options: any): any {
    if (!this.timeout) {
      return options;
    }
    return {
      ...options,
      signal: this.controller.signal,
      hooks: { afterResponse: [this.reset] }, // response headers arrived
      onDownloadProgress: this.reset, // response data arrived
    };
  }

  protected reset = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.controller.abort(new Error(`HTTP <${this.url}>: The server stopped sending the response`));
    }, this.timeout);
  };

  /** The request finished, whether successfully or not */
  stop() {
    clearTimeout(this.timer);
  }
}
