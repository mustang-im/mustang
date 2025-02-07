import type { Person } from "../Abstract/Person";
import { appGlobal } from "../app";
import { ArrayColl } from "svelte-collections";
import { assert } from "../util/util";

export class FileOrDirectory {
  id: string; /** Full file path and name */
  /** Excluding directory path. For files, including file ext. */
  name: string;
  lastMod = new Date();

  setParent(directory: Directory) {
    assert(this.name, "Please set the name first");
    this.id = directory.id + "/" + this.name;
    directory.files.add(this);
  }
}

export class File extends FileOrDirectory {
  nameWithoutExt: string; /** substring of `name`, excluding `fileExt` and dot */
  ext: string; /** substring of `name`, just the part after the last dot */
  mimetype: string;
  length: number; /* in bytes */
  contents: Blob; /** may be undefined = not loaded. Does not mean that the file is empty. */
  /** Full path to the local file on user's disk. May be null */
  filepathLocal: string;

  setFileName(val: string) {
    this.name = val;
    let pos = val.lastIndexOf(".");
    if (pos == -1) {
      this.ext = "";
      this.nameWithoutExt = val;
      return;
    }
    this.nameWithoutExt = val.substring(0, pos);
    this.ext = val.substring(pos + 1);
  }

  /** Open the native desktop app with this file */
  async openOSApp() {
    await appGlobal.remoteApp.openFileInNativeApp(this.filepathLocal);
  }
}

export class Directory extends FileOrDirectory {
  sentToFrom: Person;
  readonly files = new ArrayColl<FileOrDirectory>();
}
