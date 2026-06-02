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

  newDirectory(name: string, dir = new NextcloudDirectory()): NextcloudDirectory {
    return super.newDirectory(name, dir) as NextcloudDirectory;
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

