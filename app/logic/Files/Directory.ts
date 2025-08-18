import { FileOrDirectory } from "./FileOrDirectory";
import { File } from "./File";
import type { Person } from "../Abstract/Person";
import type { FileSharingAccount } from "./FileSharingAccount";
import { AbstractFunction, assert } from "../util/util";
import { ArrayColl, Collection } from "svelte-collections";

export class Directory extends FileOrDirectory {
  readonly files = new ArrayColl<File>();
  readonly subDirs = new ArrayColl<Directory>();
  account: FileSharingAccount;
  sentToFrom: Person;

  get children(): Collection<Directory> {
    return this.subDirs;
  }

  newDirectory(name: string): Directory {
    let dir = new Directory();
    dir.name = name;
    dir.account = this.account;
    dir.parent = this;
    return dir;
  }

  newFile(name: string): File {
    let file = new File();
    file.setFileName(name);
    file.parent = this;
    return file;
  }

  async listContents() {
  }

  async moveFileHere(file: File) {
    await this.moveFilesHere(new ArrayColl([file]));
  }

  async copyFileHere(file: File) {
    await this.copyFilesHere(new ArrayColl([file]));
  }

  async moveFilesHere(files: Collection<File>) {
    throw new AbstractFunction();
  }

  async copyFilesHere(files: Collection<File>) {
    throw new AbstractFunction();
  }

  /**
   * Helper function for `copyFilesHere()` and `moveFilesHere()`
   * @returns
   * true = Move has already been done (across accounts)
   * false = Caller needs to move messages (within the same account) */
  protected async moveOrCopyFiles(action: "move" | "copy", files: Collection<File>): Promise<boolean> {
    let sourceFolder = files.first.parent;
    assert(sourceFolder, "Need source folder");
    assert(files.contents.every(msg => msg.parent === sourceFolder), "All messages must be from the same folder");
    if (action == "move") {
      sourceFolder.files.removeAll(files);
    }
    if (this.account != sourceFolder.account) {
      for (let file of files) {
        await file.download();
        await this.addFile(file);
        if (action == "move") {
          await file.deleteIt();
        }
      }
      return true;
    }
    // Both folders need refresh
    return false;
  }

  async addFile(file: File) {
    await file.download();
    throw new AbstractFunction();
  }
}
