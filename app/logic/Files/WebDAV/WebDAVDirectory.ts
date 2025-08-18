import { Directory } from "../Directory";
import type { File } from "../File";
import type { WebDAVAccount } from "./WebDAVAccount";
import type { WebDAVFile } from "./WebDAVFile";
import { AbstractFunction, assert } from "../../util/util";
import type { ArrayColl, Collection } from "svelte-collections";

export class WebDAVDirectory extends Directory {
  declare account: WebDAVAccount;
  readonly files: ArrayColl<WebDAVFile>;
  readonly subDirs: ArrayColl<WebDAVDirectory>;

  newDirectory(name: string): WebDAVDirectory {
    let dir = new WebDAVDirectory();
    dir.name = name;
    dir.account = this.account;
    dir.parent = this;
    return dir;
  }

  async moveFilesHere(files: Collection<File>) {
    throw new AbstractFunction();
  }

  async copyFilesHere(files: Collection<File>) {
    throw new AbstractFunction();
  }
}
