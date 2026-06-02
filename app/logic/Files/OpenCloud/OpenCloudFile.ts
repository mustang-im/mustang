import { WebDAVFile } from "../WebDAV/WebDAVFile";
import { WebAppListed } from "../../WebApps/WebAppListed";
import type { OpenCloudAccount } from "./OpenCloudAccount";
import type { OpenCloudDirectory } from "./OpenCloudDirectory";
import { ArrayColl, type Collection } from "svelte-collections";
import { assert } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { gt } from "../../../l10n/l10n";

export class OpenCloudFile extends WebDAVFile {
  declare parent: OpenCloudDirectory;

  get account(): OpenCloudAccount {
    return this.parent?.account as OpenCloudAccount;
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
      apps.add(app);
    }
    return apps;
  }
}
