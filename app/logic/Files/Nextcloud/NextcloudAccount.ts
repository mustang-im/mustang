import { WebDAVAccount } from "../WebDAV/WebDAVAccount";
import { NextcloudDirectory } from "./NextcloudDirectory";
import type { EditorWebApp } from "../EditorWebApp";
import { AuthMethod } from "../../Abstract/Account";
import { appGlobal } from "../../app";
import { assert, NotReached } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { gt } from "../../../l10n/l10n";
import { ArrayColl } from "svelte-collections";

export class NextcloudAccount extends WebDAVAccount {
  readonly protocol: string = "webdav-nextcloud";
  declare readonly rootDirs: ArrayColl<NextcloudDirectory>;
  protected editorsCache: EditorWebApp[] | null = null;
  protected pushWebSocket: WebSocket | null = null;
  protected pushClosed = false;
  protected pushReconnectDelayMS = 1000;
  protected pushReconnectTimer: ReturnType<typeof setTimeout> | null = null;

  newDirectory(name: string, dir = new NextcloudDirectory()): NextcloudDirectory {
    return super.newDirectory(name, dir) as NextcloudDirectory;
  }

  async startup() {
    await super.startup();
    this.pushClosed = false;
    this.openNotifyPush().catch(ex =>
      console.warn(`${this.name}: notify_push subscription failed:`, ex?.message ?? ex));
  }

  async disconnect() {
    this.pushClosed = true;
    if (this.pushReconnectTimer) {
      clearTimeout(this.pushReconnectTimer);
      this.pushReconnectTimer = null;
    }
    try { this.pushWebSocket?.close(); } catch {}
    this.pushWebSocket = null;
    await super.disconnect();
  }

  /** Open the notify_push WebSocket. No-op if the server doesn't advertise
   * the endpoint (the `notify_push` app isn't installed) or we don't have a
   * credential to send. */
  protected async openNotifyPush() {
    if (this.pushClosed || this.pushWebSocket) {
      return;
    }
    let wsURL = await this.discoverNotifyPushURL();
    if (!wsURL) {
      return;
    }
    let { user, secret } = this.notifyPushCredentials();
    if (secret == null) {
      return;
    }
    let ws = new WebSocket(wsURL);
    this.pushWebSocket = ws;
    ws.addEventListener("open", () => {
      // notify_push handshake: two text frames, username then secret.
      ws.send(user);
      ws.send(secret);
    });
    ws.addEventListener("message", ev => {
      let msg = typeof ev.data == "string" ? ev.data : "";
      if (msg == "authenticated") {
        this.pushReconnectDelayMS = 1000;
        return;
      }
      if (msg.startsWith("err:")) {
        console.warn(`${this.name}: notify_push auth rejected:`, msg);
        return;
      }
      this.onPushEvent(msg);
    });
    ws.addEventListener("close", () => {
      this.pushWebSocket = null;
      if (this.pushClosed) {
        return;
      }
      this.pushReconnectTimer = setTimeout(() => {
        this.pushReconnectTimer = null;
        this.openNotifyPush().catch(ex =>
          console.warn(`${this.name}: notify_push reconnect failed:`, ex?.message ?? ex));
      }, this.pushReconnectDelayMS);
      this.pushReconnectDelayMS = Math.min(this.pushReconnectDelayMS * 2, 60_000);
    });
    ws.addEventListener("error", () => {
      // Browsers don't expose details; the subsequent "close" drives reconnect.
    });
  }

  /** Read `notify_push.endpoints.websocket` from the OCS capabilities API. */
  protected async discoverNotifyPushURL(): Promise<string | null> {
    let caps = await this.ocsCall("GET", "/ocs/v2.php/cloud/capabilities");
    return sanitize.url(caps?.ocs?.data?.capabilities?.notify_push?.endpoints?.websocket, null);
  }

  /** For password auth, send username + password. For OAuth2, notify_push
   * accepts an empty username and the access token as the second frame. */
  protected notifyPushCredentials(): { user: string, secret: string | null } {
    if (this.authMethod == AuthMethod.Password) {
      return { user: this.username, secret: this.password };
    }
    if (this.authMethod == AuthMethod.OAuth2 && this.oAuth2?.accessToken) {
      return { user: "", secret: this.oAuth2.accessToken };
    }
    return { user: "", secret: null };
  }

  /** notify_push event names are coarse: `notify_file`, `notify_file_id <id>`,
   * `notify_activity`, `notify_notification`. We treat any file-related event
   * as a hint to re-list the root; deeper open directories refresh on nav. */
  protected onPushEvent(event: string) {
    if (event == "notify_file" || event.startsWith("notify_file_id ")) {
      this.rootDirs.first?.listContents()
        .catch(ex => console.warn(`${this.name}: push-triggered refresh failed:`, ex?.message ?? ex));
    }
  }

  /** For setup. Verify that the URL is a WebDAV endpoint and the credentials work. */
  async verifyLogin() {
    assert(this.url, gt`Need URL`);

    // Translate web frontend URL into WebDAV URL for Nextcloud
    let urlObj = new URL(this.url);
    if (urlObj.pathname == "/") {
      urlObj.pathname = `/remote.php/dav/files/${this.username}`;
      this.url = urlObj.href;
    }

    await super.verifyLogin();
  }

  /** List Nextcloud's enabled in-browser editors (Nextcloud Office, ONLYOFFICE, …).
   * Cached per account instance — to refresh after the admin enables/disables
   * an app, clear `editorsCache`. */
  async listApps(): Promise<EditorWebApp[]> {
    if (this.editorsCache) {
      return this.editorsCache;
    }
    this.editorsCache = [];
    let json = await this.ocsCall("GET", "/ocs/v2.php/apps/files/api/v1/directEditing");
    let editors = Object.values(json?.ocs?.data?.editors ?? {}) as any[];
    for (let editor of editors) {
      let id = sanitize.alphanumdash(editor?.id, null);
      if (!id) {
        continue;
      }
      let urlObj = new URL(this.url);
      urlObj.pathname = `/apps/${id}/img/app.svg`;
      let iconURL = urlObj.href;
      urlObj.pathname = `/apps/${id}`;
      let homeURL = urlObj.href;
      this.editorsCache.push({
        id: id,
        name: sanitize.nonemptylabel(editor?.name, id),
        mimetypes: sanitize.array(editor?.mimetypes).filter(mimetype => sanitize.nonemptystring(mimetype, null)),
        optionalMimetypes: sanitize.array(editor?.optionalMimetypes).filter(mimetype => sanitize.nonemptystring(mimetype, null)),
        icon: iconURL,
        homepage: homeURL,
      });
    }
    // richdocuments (Collabora) doesn't register with directEditing, so it's
    // missing from the editors list above. The capabilities endpoint reports
    // it (with the MIME types it can open) when the app is installed.
    let caps = await this.ocsCall("GET", "/ocs/v2.php/cloud/capabilities");
    let rd = caps?.ocs?.data?.capabilities?.richdocuments;
    if (rd) {
      let id = "richdocuments";
      let urlObj = new URL(this.url);
      urlObj.pathname = `/apps/${id}/img/app.svg`;
      let iconURL = urlObj.href;
      urlObj.pathname = `/apps/${id}`;
      let homeURL = urlObj.href;
      this.editorsCache.push({
        id: id,
        name: sanitize.nonemptylabel(rd.productName, "Office"),
        mimetypes: sanitize.array(rd.mimetypes).filter(mimetype => sanitize.nonemptystring(mimetype, null)),
        optionalMimetypes: sanitize.array(rd.mimetypesNoDefaultOpen).filter(mimetype => sanitize.nonemptystring(mimetype, null)),
        icon: iconURL,
        homepage: homeURL,
      });
    }
    return this.editorsCache;
  }

  /** Generic OCS HTTPS request, with Authorization and OCS-APIRequest headers. */
  async ocsCall(method: "GET" | "POST", path: string,
                          formBody?: Record<string, string>): Promise<any> {
    let url = new URL(path, this.url).href;
    let headers: Record<string, string> = {
      "OCS-APIRequest": "true",
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
    let ky = await appGlobal.remoteApp.kyCreate({ headers, result: "json", timeout: 2000 });
    if (method == "GET") {
      return await ky.get(url, {});
    } else if (method == "POST") {
      let body = formBody ? new URLSearchParams(formBody).toString() : "";
      return await ky.post(url, {
        body,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
    } else {
      throw new NotReached();
    }
  }
}

