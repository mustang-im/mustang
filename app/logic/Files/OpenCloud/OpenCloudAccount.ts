import { WebDAVAccount } from "../WebDAV/WebDAVAccount";
import { OpenCloudDirectory } from "./OpenCloudDirectory";
import type { EditorWebApp } from "../EditorWebApp";
import { AuthMethod } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { assert, NotReached } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { gt } from "../../../l10n/l10n";
import { ArrayColl } from "svelte-collections";

export class OpenCloudAccount extends WebDAVAccount {
  readonly protocol: string = "webdav-opencloud";
  declare readonly rootDirs: ArrayColl<OpenCloudDirectory>;
  protected editorsCache: EditorWebApp[] | null = null;
  protected pushAbort: AbortController | null = null;
  protected pushClosed = false;
  protected pushReconnectDelayMS = 1000;
  protected pushReconnectTimer: ReturnType<typeof setTimeout> | null = null;

  newDirectory(name: string, dir = new OpenCloudDirectory()): OpenCloudDirectory {
    return super.newDirectory(name, dir) as OpenCloudDirectory;
  }

  async startup() {
    await super.startup();
    this.pushClosed = false;
    this.openSSE().catch(ex =>
      console.warn(`${this.name}: SSE subscription failed:`, ex?.message ?? ex));
  }

  async disconnect() {
    this.pushClosed = true;
    if (this.pushReconnectTimer) {
      clearTimeout(this.pushReconnectTimer);
      this.pushReconnectTimer = null;
    }
    try { this.pushAbort?.abort(); } catch {}
    this.pushAbort = null;
    await super.disconnect();
  }

  /** Open the oCIS/openCloud Server-Sent Events stream and parse text/event-stream
   * inline. ownCloud 10 has no SSE endpoint and 404s — we treat that as a
   * permanent failure and don't reconnect. */
  protected async openSSE() {
    if (this.pushClosed || this.pushAbort) {
      return;
    }
    let urlObj = new URL(this.url);
    urlObj.pathname = "/ocs/v2.php/apps/notifications/api/v1/notifications/sse";
    urlObj.search = "";
    let headers: Record<string, string> = {
      "OCS-APIRequest": "true",
      "Accept": "text/event-stream",
      "Cache-Control": "no-cache",
    };
    if (this.authMethod == AuthMethod.OAuth2) {
      if (!this.oAuth2.isLoggedIn) {
        await this.oAuth2.login(false);
      }
      headers["Authorization"] = "Bearer " + this.oAuth2.accessToken;
    } else if (this.authMethod == AuthMethod.Password) {
      headers["Authorization"] = "Basic " + btoa(`${this.username}:${this.password}`);
    } else {
      return;
    }
    let controller = new AbortController();
    this.pushAbort = controller;
    let isPermanentFailure = false;
    try {
      let resp = await fetch(urlObj.href, {
        method: "GET",
        headers,
        signal: controller.signal,
      });
      if (!resp.ok || !resp.body) {
        isPermanentFailure = resp.status >= 400 && resp.status < 500;
        console.warn(`${this.name}: SSE HTTP ${resp.status}`);
        return;
      }
      this.pushReconnectDelayMS = 1000;
      let reader = resp.body.getReader();
      let decoder = new TextDecoder();
      let buf = "";
      let cur = { type: "message", data: "" };
      while (true) {
        let { done, value } = await reader.read();
        if (done) {
          break;
        }
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) != -1) {
          let line = buf.slice(0, nl).replace(/\r$/, "");
          buf = buf.slice(nl + 1);
          if (line == "") {
            if (cur.data) {
              this.onPushEvent(cur);
            }
            cur = { type: "message", data: "" };
            continue;
          }
          if (line.startsWith(":")) {
            continue; // keepalive comment
          }
          let colon = line.indexOf(":");
          let field = colon == -1 ? line : line.slice(0, colon);
          let val = colon == -1 ? "" : line.slice(colon + 1).replace(/^ /, "");
          if (field == "event") {
            cur.type = val;
          } else if (field == "data") {
            cur.data += (cur.data ? "\n" : "") + val;
          }
        }
      }
    } catch (ex: any) {
      if (ex?.name != "AbortError") {
        console.warn(`${this.name}: SSE error:`, ex?.message ?? ex);
      }
    } finally {
      this.pushAbort = null;
      if (!this.pushClosed && !isPermanentFailure) {
        this.pushReconnectTimer = setTimeout(() => {
          this.pushReconnectTimer = null;
          this.openSSE().catch(ex =>
            console.warn(`${this.name}: SSE reconnect failed:`, ex?.message ?? ex));
        }, this.pushReconnectDelayMS);
        this.pushReconnectDelayMS = Math.min(this.pushReconnectDelayMS * 2, 60_000);
      }
    }
  }

  /** oCIS userlog/SSE event names vary by server version. Skip pure UI
   * notifications; refresh the root on anything else as a conservative
   * default until the taxonomy is pinned down. */
  protected onPushEvent(ev: { type: string, data: string }) {
    if (ev.type == "userlog-notification" || ev.type == "notification") {
      return;
    }
    this.rootDirs.first?.listContents()
      .catch(ex => console.warn(`${this.name}: push-triggered refresh failed:`, ex?.message ?? ex));
  }

  /** For setup. Verify that the URL is a WebDAV endpoint and the credentials work. */
  async verifyLogin() {
    assert(this.url, gt`Need URL`);

    // Translate web frontend URL into WebDAV URL for openCloud / ownCloud.
    // Both openCloud's legacy-compat layer and ownCloud Classic accept the
    // `/remote.php/dav/files/<username>` path.
    let urlObj = new URL(this.url);
    if (urlObj.pathname == "/") {
      urlObj.pathname = `/remote.php/dav/files/${this.username}`;
      this.url = urlObj.href;
    }

    await super.verifyLogin();
  }

  /** List openCloud's enabled in-browser editors (Collabora, OnlyOffice, …).
   * Cached per account instance — to refresh after the admin enables/disables
   * an app, clear `editorsCache`. */
  async listApps(): Promise<EditorWebApp[]> {
    if (this.editorsCache) {
      return this.editorsCache;
    }
    let appsByID = new Map<string, EditorWebApp>();
    let json = await this.appCall("GET", "/app/list");
    let entries = sanitize.array(json?.["mime-types"], []) as any[];
    // openCloud's response is grouped by MIME type, with each entry carrying
    // a list of app_providers. Flatten into a per-provider list.
    for (let entry of entries) {
      let mimeType = sanitize.nonemptystring(entry?.mime_type, null);
      let apps = entry?.app_providers;
      if (!mimeType || !sanitize.array(apps, null)) {
        continue;
      }
      for (let app of apps) {
        let name = sanitize.nonemptylabel(app?.name, null);
        if (!name) {
          continue;
        }
        let id = name.toLowerCase().replaceAll(" ", "-");
        let existingApp = appsByID.get(id);
        if (existingApp) {
          if (!existingApp.mimetypes.includes(mimeType)) {
            existingApp.mimetypes.push(mimeType);
          }
          continue;
        }
        let iconURL = new URL(this.url);
        iconURL.pathname = `/apps/${id}/img/app.svg`;
        let homeURL = new URL(this.url);
        homeURL.pathname = `/apps/${id}`;
        appsByID.set(id, {
          id: id,
          name: name,
          mimetypes: [mimeType],
          optionalMimetypes: [],
          icon: sanitize.url(app?.icon, iconURL.href),
          homepage: homeURL.href,
        });
      }
    }
    return this.editorsCache = Array.from(appsByID.values());
  }

  /** Generic openCloud app-provider HTTPS request, with Authorization header. */
  async appCall(method: "GET" | "POST", path: string): Promise<any> {
    let url = new URL(path, this.url).href;
    let headers: Record<string, string> = {
      "Accept": "application/json",
    };
    if (this.authMethod == AuthMethod.OAuth2) {
      if (!this.oAuth2.isLoggedIn) {
        await this.oAuth2.login(false);
      }
      headers["Authorization"] = "Bearer " + this.oAuth2.accessToken;
    } else if (this.authMethod == AuthMethod.Password) {
      headers["Authorization"] = "Basic " + btoa(`${this.username}:${this.password}`);
    }
    let ky = await appGlobal.remoteApp.kyCreate({ headers, result: "json", timeout: 10000 });
    if (method == "GET") {
      return await ky.get(url, {});
    } else if (method == "POST") {
      return await ky.post(url, {});
    } else {
      throw new NotReached();
    }
  }
}
