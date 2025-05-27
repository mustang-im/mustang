import { ArrayColl, Collection } from "svelte-collections";
import { Account } from "../Abstract/Account";
import { Directory } from "./Directory";
import type { File } from "./File";

export class FileSharingAccount extends Account {
  readonly protocol: string = "files";
  readonly rootDirs = new ArrayColl<Directory>;
  storage: FileStorage;

  newDirectory(): Directory {
    let dir = new Directory();
    dir.account = this;
    return dir;
  }

  async sync() {
  }
}

export interface FileStorage {
  readDirectoryHierarchy(account: FileSharingAccount): Promise<void>;
  saveDirectory(directory: Directory): Promise<void>;
  deleteDirectory(directory: Directory): Promise<void>;
  readFile(file: File): Promise<void>;
  readFileContent(file: File): Promise<void>;
  saveFile(file: File): Promise<void>;
  saveFiles(files: Collection<File>): Promise<void>;
  saveFileTags(file: File): Promise<void>;
  deleteFiles(file: File): Promise<void>;
  readAllFiles(directory: Directory, limit?: number, startWith?: number): Promise<ArrayColl<File>>;
}
