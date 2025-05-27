import { Directory } from "../Directory";
import type { File } from "../File";
import type { HarddriveAccount } from "./HarddriveAccount";
import { AbstractFunction, assert } from "../../util/util";
import type { Collection } from "svelte-collections";
import { appGlobal } from "../../app";

export class HarddriveDirectory extends Directory {
  declare account: HarddriveAccount;

  newDirectory(name: string): HarddriveDirectory {
    let dir = new HarddriveDirectory();
    dir.name = name;
    dir.account = this.account;
    dir.parent = this;
    return dir;
  }

  async listContents() {
    this.files.clear();
    this.subDirs.clear();
    let entries = await appGlobal.remoteApp.listDirectoryContents(this.path, true, false);
    for (let entry of entries) {
      if (await entry.isDirectory) {
        let dir = this.newDirectory(entry.name);
        dir.path = dir.filepathLocal = entry.path;
        dir.lastMod = entry.lastMod;
        this.subDirs.add(dir);
      } else {
        let file = this.newFile(entry.name);
        file.path = file.filepathLocal = entry.path;
        file.size = entry.size;
        file.lastMod = entry.lastMod;
        this.files.add(file);
      }
    }
  }

  async moveFilesHere(files: Collection<File>) {
    throw new AbstractFunction();
  }

  async copyFilesHere(files: Collection<File>) {
    throw new AbstractFunction();
  }
}
