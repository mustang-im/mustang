import { WebDAVFile } from "../WebDAV/WebDAVFile";
import { WebAppListed } from "../../WebApps/WebAppListed";
import type { OpenCloudAccount } from "./OpenCloudAccount";
import type { OpenCloudDirectory } from "./OpenCloudDirectory";
import { ArrayColl, type Collection } from "svelte-collections";
import { assert } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { gt } from "../../../l10n/l10n";
import type { FileStat, ResponseDataDetailed } from "webdav";

export class OpenCloudFile extends WebDAVFile {
  declare parent: OpenCloudDirectory;
  /** openCloud/CS3 `oc:fileid`, format `<storageID>$<spaceID>!<opaqueID>`.
   * Lazy-fetched by `getResourceID()`. */
  protected fileID: string | null = null;

  get account(): OpenCloudAccount {
    return this.parent?.account as OpenCloudAccount;
  }

  protected async getFileID(): Promise<string> {
    if (this.fileID) {
      return this.fileID;
    }
    await this.account.login(false);
    const kBody =
      `<?xml version="1.0" encoding="utf-8"?>` +
      `<d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">` +
        `<d:prop><oc:fileid/></d:prop>` +
      `</d:propfind>`;
    let result = await this.account.client.stat(this.path, {
      details: true,
      data: kBody,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    }) as ResponseDataDetailed<FileStat>;
    let id = sanitize.nonemptystring(result?.data?.props?.fileid as any, null);
    assert(id, gt`Could not get the openCloud resource ID for ${this.path}`);
    this.fileID = id;
    return id;
  }

  /** Create a public read-only share link for this file via the libre-graph
   * `createLink` endpoint. Returns the browser URL of the share. */
  async shareLink(): Promise<string> {
    let fileID = await this.getFileID();
    // resourceID = "<storageID>$<spaceID>!<opaqueID>"; drive ID is the part
    // before "!", item ID is the whole resource ID.
    let bang = fileID.indexOf("!");
    assert(bang > 0, `Malformed openCloud file ID: ${fileID}`);
    let driveID = fileID.substring(0, bang);
    let itemID = fileID;
    let json = await this.account.graphCall("POST",
      `/graph/v1beta1/drives/${encodeURIComponent(driveID)}/items/${encodeURIComponent(itemID)}/createLink`,
      { type: "view" });
    return sanitize.url(json?.link?.webUrl, null);
  }

  /**
   * Editors enabled on the openCloud server that can open this file.
   * E.g. Collabora, OnlyOffice, Euro-Office.
   *
   * The WebAppListed has a single-use direct-edit URL in `.start`.
   * Calling `instantiate()` and passing to WebAppRunner shows the editor with this file.
   *
   * Data from the openCloud app-provider `/app/open-with-web` endpoint. */
  async availableOnlineEditors(): Promise<Collection<WebAppListed>> {
    let apps = new ArrayColl<WebAppListed>();
    let editors = await this.account.listApps();
    for (let editor of editors) {
      let allMimetypes = (editor.mimetypes ?? []).concat(editor.optionalMimetypes ?? []);
      if (!allMimetypes.includes(this.mimetype)) {
        continue;
      }
      assert(editor, gt`Editor ${editor.id} not found`);
      let params = new URLSearchParams({
        file: this.userRelativePath(this.path),
        app_name: editor.name,
      });
      let json = await this.account.appCall("POST", "/app/open-with-web?" + params);
      let startURL = sanitize.url(json?.app_url, null);
      assert(startURL, gt`Could not open this document for editing. ${`/app/open-with-web`} returned no valid URL`);
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
