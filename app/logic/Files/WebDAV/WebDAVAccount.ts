import { FileSharingAccount } from "../FileSharingAccount";
import { WebDAVDirectory } from "./WebDAVDirectory";
import { AuthMethod } from "../../Abstract/Account";
import { ArrayColl } from "svelte-collections";
import { NotReached, assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { appGlobal } from "../../app";
import type { AuthType, OAuthToken, WebDAVClient } from "webdav";

export class WebDAVAccount extends FileSharingAccount {
  readonly protocol: string = "webdav";
  declare readonly rootDirs: ArrayColl<WebDAVDirectory>;
  client: WebDAVClient;

  newDirectory(name: string): WebDAVDirectory {
    return super.newDirectory(name, new WebDAVDirectory()) as WebDAVDirectory;
  }

  async login(interactive: boolean) {
    let useOAuth2 = this.authMethod == AuthMethod.OAuth2;
    let usePassword = this.authMethod == AuthMethod.Password;
    let options: { authType?: AuthType, username?: string, password?: string, token?: OAuthToken };
    if (useOAuth2) {
      assert(this.oAuth2, gt`Need OAuth2 configuration`);
      if (!this.oAuth2.isLoggedIn) {
        await this.oAuth2.login(interactive);
      }
      options = {
        authType: "token" as AuthType,
        token: {
          access_token: this.oAuth2.accessToken,
          token_type: "Bearer",
        },
      };
    } else if (usePassword) {
      options = {
        username: this.username,
        password: this.password,
      };
    } else {
      throw new NotReached(gt`Unknown authentication method`);
    }
    this.client = await appGlobal.remoteApp.createWebDAVClient(this.url, options);
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
    if (!this.client) {
      await this.login(false);
    }
    if (this.rootDirs.isEmpty) {
      let root = this.newDirectory(gt`Files`);
      root.path = "/";
      this.rootDirs.add(root);
      await root.listContents();
    }
  }
}
