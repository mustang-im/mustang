import { FileSharingAccount } from "../FileSharingAccount";
import { WebDAVDirectory } from "./WebDAVDirectory";
import { AuthMethod } from "../../Abstract/Account";
import { ArrayColl } from "svelte-collections";
import { NotImplemented, NotReached, assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { appGlobal } from "../../app";
import type { DAVClient } from "tsdav";

export class WebDAVAccount extends FileSharingAccount {
  readonly protocol: string = "webdav";
  declare readonly rootDirs: ArrayColl<WebDAVDirectory>;
  client: DAVClient;

  newDirectory(name: string): WebDAVDirectory {
    let dir = new WebDAVDirectory();
    dir.name = name;
    dir.account = this;
    return dir;
  }

  async login(interactive: true) {
    let useOAuth2 = this.authMethod == AuthMethod.OAuth2;
    let usePassword = this.authMethod == AuthMethod.Password;
    if (useOAuth2) {
      assert(this.oAuth2, gt`Need OAuth2 configuration`);
      if (!this.oAuth2.isLoggedIn) {
        await this.oAuth2.login(interactive);
      }
    }
    assert(usePassword || useOAuth2, gt`Unknown authentication method`);
    let options = {
      serverUrl: this.url,
      authType: useOAuth2 ? "Oauth" : "Basic",
      credentials: useOAuth2 ? {
        access_token: this.oAuth2.accessToken,
      } : {
        username: this.username,
        password: usePassword ? this.password : undefined,
      },
      defaultAccountType: "webdav",
    };
    this.client = await appGlobal.remoteApp.createWebDAVClient(options);
    await this.client.login();
  }

  get isLoggedIn(): boolean {
    if (this.authMethod == AuthMethod.OAuth2) {
      return this.oAuth2.isLoggedIn;
    } else if (this.authMethod == AuthMethod.Password) {
      return !!this.password;
    } else {
      throw new NotReached(gt`Unknown authentication method`);
    }
  }

  async sync() {
    if (!this.dbID) {
      await this.save();
    }

    let response = await this.client.collectionQuery({
      url: this.url,
      body: null, // TODO
    });
    let entries = new ArrayColl(response);
    assert(entries.hasItems, "No files found");
    console.log("Found WebDAV root directories", entries.contents);
    this.rootDirs.clear();
    for (let entry of entries) {
      let dir = this.newDirectory("a"); // TODO entry.name
      try {
        // TODO convertVCardToPerson(entry.data, person);
      } catch (ex) {
        console.warn(ex);
        continue;
      }
      // dir.syncState = entry.etag;
      this.rootDirs.add(dir);
    }

    await this.save();
  }

  async save() {
    throw new NotImplemented(); // TODO DB for files
  }
}
