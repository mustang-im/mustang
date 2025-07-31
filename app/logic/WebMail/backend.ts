import { NotImplemented } from "util/util";
import ky from "ky";

/** Implements the same functions as backend/backend.ts ,
 * but for the web browser.
 * Some of the functions are disabled in this case.
 */
export class WebMailBackend {
  async kyCreate(defaultOptions: any): Promise<any> {
    /* `ky` (like axios) is both a function and acts like an object with functions get(), post() etc. as properties,
     * which confuses jpc, so make it only an object. */
    let kyObj = {};
    let kyFunc = ky.create(defaultOptions);
    for (let name in kyFunc) {
      kyObj[name] = async (input, options) => {
        // let resultKy = ky.post(input, options);
        let kyFetch = kyFunc[name](input, options);
        let resultType = options?.result || defaultOptions?.result;
        if (resultType &&
          ["text", "json", "formData", "blob", "arrayBuffer"].includes(resultType) &&
          ["get", "put", "post", "patch", "delete", "head"].includes(name)) {
          try {
            // console.log("Calling server", "input", input, "options", options, "defaults", defaultOptions);
            // let json = await resultKy.json();
            return await kyFetch[resultType]();
          } catch (ex) {
            throw new HTTPFetchError(ex);
          }
        } else {
          return kyFetch;
        }
      }
    }
    return kyObj;
  }
  async isOSNotificationSupported(): Promise<boolean> {
    return false;
  }
  async newTrayIcon() {
  }
  async setBadgeCount() {
  }
  async minimizeMainWindow() {
  }
  async unminimizeMainWindow() {
  }
  async maximizeMainWindow() {
  }
  async writeTextToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
  async openExternalURL(url: string) {
    window.open(url, "_blank", "noopener, noreferrer");
  }
  async openFileInNativeApp(filePath: string) {
    let url = "file://" + filePath;
    window.open(url, "_blank", "noopener");
  }
  async showFileInFolder(filePath: string) {
    throw new NotImplemented("Cannot open file path in browser");
  }
  async restartApp() {
    window.location.reload();
  }
  async setTheme() {
  }
  /** For OAuth2 and EWS
   * @param config ky config @see <https://github.com/sindresorhus/ky>
   */
  async postHTTP(url: string, data: any, responseType: string, config: any): Promise<any> {
    switch (config.headers['Content-Type']) {
      case 'application/x-www-form-urlencoded':
        config.body = new URLSearchParams(data);
        break;
      case 'application/json':
        config.json = data;
        break;
      default:
        config.body = data;
        break;
    }
    let response = await ky.post(url, config);
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: await response[responseType](),
      WWWAuthenticate: response.headers.get("WWW-Authenticate"),
    };
  }
  /**
   * For EWS
   * @param config ky config @see <https://github.com/sindresorhus/ky>
   */
  async streamHTTP(url: string, data: any, config: any) {
    config.body = data;
    let response = await ky.post(url, config);
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: response.body.pipeThrough(new TextDecoderStream()),
      WWWAuthenticate: response.headers.get("WWW-Authenticate"),
    };
  }
}

export class HTTPFetchError extends Error {
  url: string;
  redirectedURL: string;
  code: string;
  httpCode: number;
  httpStatusText: string;
  httpMethod: string;
  hostname: string;

  constructor(ex: Error) {
    super(ex?.message ?? ex + "");
    let request = (ex as any).request;
    let response = (ex as any).response;
    let cause = (ex as any).cause
    if (request && response) {
      this.url = request.url;
      this.redirectedURL = response.url != request.url ? response.url : undefined;
      this.httpCode = response.status;
      this.httpStatusText = response.statusText;
      this.httpMethod = request.method;
      this.hostname = new URL(this.url).hostname;
      this.message = `HTTP ${this.httpMethod} <${this.url}>${this.redirectedURL ? ` redirected to <${this.redirectedURL}>` : ''} failed with ${this.httpCode} ${this.httpStatusText}`;
    } else if (cause) {
      this.code = cause.code;
      this.hostname = cause.hostname;
      if (cause.code == "ENOTFOUND") {
        this.message = `HTTP host ${cause.hostname} not found`;
      } else if (cause.code == "ECONNREFUSED") {
        this.message = `HTTP host ${cause.hostname} connection refused`;
      }
    }
  }
}
