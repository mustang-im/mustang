/** Defense in depth for the sandboxed frames that run addon code (`addon-sandbox.html`).
 * Their opaque origin and the page's own Content-Security-Policy are the first line of defense.
 * Even if those fail, addon frames here can't navigate, can't reach localhost or the local network,
 * get no cookies, and get no permissions.
 *
 * An addon frame is a sub frame with an opaque origin whose URL is `addon-sandbox.html` next to the app,
 * and every frame inside it. An addon controls neither its origin nor its URL path. */
import type { Session, WebContents, WebFrameMain } from "electron";
import { BlockList, isIP } from "node:net";

export class AddonFrameGuard {
  protected localAddresses = new BlockList();

  constructor() {
    for (let [network, prefix] of [
      ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16],
      ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["224.0.0.0", 3],
    ] as [string, number][]) {
      this.localAddresses.addSubnet(network, prefix, "ipv4");
    }
    for (let [network, prefix] of [
      ["::", 96], ["::ffff:0:0", 96], ["64:ff9b::", 96], ["64:ff9b:1::", 48], ["fc00::", 7], ["fe80::", 10], ["fec0::", 10], ["ff00::", 8],
    ] as [string, number][]) {
      this.localAddresses.addSubnet(network, prefix, "ipv6");
    }
  }

  install(session: Session): void {
    session.webRequest.onBeforeRequest({ urls: ["<all_urls>"] }, (details, callback) => {
      callback({ cancel: this.isInAddonFrame(details.frame) && !this.isAllowedURL(details.url) });
    });
    session.setPermissionRequestHandler((webContents, _permission, callback, details) => {
      callback(details.isMainFrame || !this.isAddonFrameURL(details.requestingUrl, webContents));
    });
    session.setPermissionCheckHandler((webContents, _permission, requestingOrigin, details) =>
      details.isMainFrame || !(requestingOrigin == "null" || this.isAddonFrameURL(details.requestingUrl, webContents)));
  }

  /** For every new `WebContents` */
  protect(webContents: WebContents): void {
    webContents.on("will-frame-navigate", event => {
      if (this.isInAddonFrame(event.frame) || this.isInAddonFrame(event.initiator)) {
        event.preventDefault();
      }
    });
  }

  /** For the session's only `onBeforeSendHeaders` listener */
  removeRequestCookies(frame: WebFrameMain | null | undefined, headers: Record<string, string>): void {
    if (!this.isInAddonFrame(frame)) {
      return;
    }
    for (let name of Object.keys(headers)) {
      if (name.toLowerCase() == "cookie") {
        delete headers[name];
      }
    }
  }

  /** For the session's only `onHeadersReceived` listener */
  removeResponseCookies(frame: WebFrameMain | null | undefined, headers: Record<string, string[]>): void {
    if (!this.isInAddonFrame(frame)) {
      return;
    }
    for (let name of Object.keys(headers)) {
      if (name.toLowerCase() == "set-cookie") {
        delete headers[name];
      }
    }
  }

  /** The frame is an addon frame or inside one */
  isInAddonFrame(frame: WebFrameMain | null | undefined): boolean {
    const kMaxDepth = 100;
    try {
      for (let level = 0; frame && level < kMaxDepth; level++) {
        if (frame.parent && frame.origin == "null" && this.isSandboxPage(frame.url, frame.top.url)) {
          return true;
        }
        frame = frame.parent;
      }
      return false;
    } catch (ex) {
      // The frame is gone
      return true;
    }
  }

  /** For permission requests, which give only the URL of the frame. Includes frames that an addon frame created. */
  protected isAddonFrameURL(url: string, webContents: WebContents | null): boolean {
    return url.startsWith("about:") || url.startsWith("blob:null/") ||
      this.isSandboxPage(url, webContents?.mainFrame?.url ?? "");
  }

  protected isSandboxPage(url: string, appURL: string): boolean {
    if (!URL.canParse(url) || !URL.canParse(appURL)) {
      return false;
    }
    let page = new URL(url);
    let sandboxPage = new URL("addon-sandbox.html", appURL);
    return page.protocol == sandboxPage.protocol && page.host == sandboxPage.host && page.pathname == sandboxPage.pathname;
  }

  /** Addon frames may load only from https servers on the internet, and their own `blob:` and `data:` URLs */
  isAllowedURL(urlString: string): boolean {
    if (!URL.canParse(urlString)) {
      return false;
    }
    let url = new URL(urlString);
    if (url.protocol == "blob:" || url.protocol == "data:") {
      return true;
    }
    if (url.protocol != "https:") {
      return false;
    }
    let host = url.hostname.toLowerCase().replace(/\.$/, "").replace(/^\[(.*)\]$/, "$1");
    let ipVersion = isIP(host);
    if (ipVersion) {
      return !this.localAddresses.check(host, ipVersion == 6 ? "ipv6" : "ipv4");
    }
    return host.includes(".") && !/(^|\.)(localhost|local|internal|home\.arpa)$/.test(host);
  }
}
