import { WebDAVFile } from "../WebDAV/WebDAVFile";
import { WebAppListed } from "../../WebApps/WebAppListed";
import type { NextcloudAccount } from "./NextcloudAccount";
import type { NextcloudDirectory } from "./NextcloudDirectory";
import { ArrayColl, type Collection } from "svelte-collections";
import { assert } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { gt } from "../../../l10n/l10n";
import type { FileStat, ResponseDataDetailed } from "webdav";


export class NextcloudFile extends WebDAVFile {
  declare parent: NextcloudDirectory;
  /** Nextcloud `oc:fileid`. Lazy-fetched by `getFileID()`. */
  protected fileID: number | null = null;

  get account(): NextcloudAccount {
    return this.parent?.account as NextcloudAccount;
  }

  protected async getFileID(): Promise<number> {
    if (this.fileID) {
      return this.fileID;
    }
    await this.account.login(false);
    /** Ask the Nextcloud DAV FilesPlugin for `oc:fileid`.
     * Not returned by allprop, so we have to request it explicitly. */
    const kFileIDPropfindBody =
      `<?xml version="1.0" encoding="utf-8"?>` +
      `<d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">` +
        `<d:prop><oc:fileid/></d:prop>` +
      `</d:propfind>`;
    let result = await this.account.client.stat(this.path, {
      details: true,
      data: kFileIDPropfindBody,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    }) as ResponseDataDetailed<FileStat>;
    let id = sanitize.integer(result?.data?.props?.fileid as any, null);
    assert(id, `Could not get the Nextcloud file ID for ${this.path}`);
    this.fileID = id;
    return id;
  }

  /**
   * Editors enabled on the Nextcloud server that can open this file.
   * E.g. Collabora, OnlyOffice, Euro-Office.
   *
   * The WebAppListed has a single-use direct-edit URL in `.start`.
   * Calling `instantiate()` and passing to WebAppRunner shows the editor with this file.
   *
   * Data from the OCS Direct Editing `/open` endpoint. */
  async availableOnlineEditors(): Promise<Collection<WebAppListed>> {
    let apps = new ArrayColl<WebAppListed>();
    let editors = await this.account.listApps();
    for (let editor of editors) {
      let allMimetypes = (editor.mimetypes ?? []).concat(editor.optionalMimetypes ?? []);
      if (!allMimetypes.includes(this.mimetype)) {
        continue;
      }
      let startURL: string | null;
      if (editor.id == "richdocuments") {
        // OCS createDirect creates a one-time token.
        // The resulting /apps/richdocuments/direct/{token} URL loads with no cookie/session.
        let fileID = await this.getFileID();
        let json = await this.account.ocsCall("POST",
          "/ocs/v2.php/apps/richdocuments/api/v1/document",
          { fileId: String(fileID) });
        startURL = sanitize.url(json?.ocs?.data?.url, null);
      } else {
        let json = await this.account.ocsCall("POST",
          "/ocs/v2.php/apps/files/api/v1/directEditing/open",
          {
            path: this.userRelativePath(this.path),
            editorId: editor.id,
          });
        startURL = sanitize.url(json?.ocs?.data?.url, null);
      }
      assert(startURL, gt`Could not open this document for editing. The editor returned no valid URL`);
      let app = new WebAppListed();
      app.id = this.account.id + "-" + editor.id;
      app.name = { en: editor.name };
      app.description = { en: `${editor.name} on ${this.account.name} *=> (App name) on (Cloud account name)` };
      app.icon = editor.icon;
      app.homepage = editor.homepage;
      app.pricePage = "";
      app.categoryFullIDs = ["productivity"];
      app.start = startURL;
      app.webSessionID = this.account.webSessionID;
      apps.add(app);
    }
    return apps;
  }
}
