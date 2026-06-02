import { WebDAVFile } from "../WebDAV/WebDAVFile";
import { WebAppListed } from "../../WebApps/WebAppListed";
import type { NextcloudAccount } from "./NextcloudAccount";
import type { NextcloudDirectory } from "./NextcloudDirectory";
import { ArrayColl, type Collection } from "svelte-collections";
import { assert } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { gt } from "../../../l10n/l10n";

export class NextcloudFile extends WebDAVFile {
  declare parent: NextcloudDirectory;

  get account(): NextcloudAccount {
    return this.parent?.account as NextcloudAccount;
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
      let json = await this.account.ocsCall("POST",
        "/ocs/v2.php/apps/files/api/v1/directEditing/open",
        {
          path: this.userRelativePath(this.path),
          editorId: editor.id,
        });
      let startURL = sanitize.url(json?.ocs?.data?.url, null);
      assert(startURL, gt`Could not open this document for editing. ${`Direct Editing /open`} returned no valid URL`);
      let app = new WebAppListed();
      app.id = this.account.id + "-" + editor.id;
      app.name = { en: editor.name };
      app.description = { en: `${editor.name} on ${this.account.name} *=> (App name) on (Cloud account name)` };
      app.icon = editor.icon;
      app.homepage = editor.homepage;
      app.pricePage = "";
      app.categoryFullIDs = ["productivity"];
      app.start = startURL;
      apps.add(app);
    }
    return apps;
  }
}
