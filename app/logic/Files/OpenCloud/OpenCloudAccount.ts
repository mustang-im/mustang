import { WebDAVAccount } from "../WebDAV/WebDAVAccount";
import { OpenCloudDirectory } from "./OpenCloudDirectory";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl } from "svelte-collections";

export class OpenCloudAccount extends WebDAVAccount {
  readonly protocol: string = "webdav-opencloud";
  declare readonly rootDirs: ArrayColl<OpenCloudDirectory>;

  newDirectory(name: string, dir = new OpenCloudDirectory()): OpenCloudDirectory {
    return super.newDirectory(name, dir) as OpenCloudDirectory;
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
}
