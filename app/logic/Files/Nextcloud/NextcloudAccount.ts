import { WebDAVAccount } from "../WebDAV/WebDAVAccount";
import { NextcloudDirectory } from "./NextcloudDirectory";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl } from "svelte-collections";

export class NextcloudAccount extends WebDAVAccount {
  readonly protocol: string = "webdav-nextcloud";
  declare readonly rootDirs: ArrayColl<NextcloudDirectory>;

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
}
