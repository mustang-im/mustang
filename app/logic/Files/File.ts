import type { Person } from "../Abstract/Person";
import { ArrayColl } from "svelte-collections";
import { assert } from "../util/util";

export class FileOrDirectory {
  id: string; /** Full file path and name */
  name: string; /** Excluding directory. For files, including file ext. */
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
}

export class Directory extends FileOrDirectory {
  sentToFrom: Person;
  readonly files = new ArrayColl<FileOrDirectory>();
}
