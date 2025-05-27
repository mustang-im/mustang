import type { FileStorage, FileSharingAccount } from "../FileSharingAccount";
import { File } from "../File";
import { Directory } from "../Directory";
import { ArrayColl, type Collection } from "svelte-collections";

/** Does not save. Not even account config. Useful for tests. */
export class DummyFileStorage implements FileStorage {
  async readDirectoryHierarchy(account: FileSharingAccount): Promise<void> {
  }
  async saveDirectory(directory: Directory): Promise<void> {
  }
  async deleteDirectory(directory: Directory): Promise<void> {
  }
  async readFile(file: File): Promise<void> {
  }
  async readFileContent(file: File): Promise<void> {
  }
  async saveFile(file: File): Promise<void> {
  }
  async saveFiles(files: Collection<File>): Promise<void> {
  }
  async saveFileTags(file: File): Promise<void> {
  }
  async deleteFiles(file: File): Promise<void> {
  }
  async readAllFiles(directory: Directory, limit?: number, startWith?: number): Promise<ArrayColl<File>> {
    return new ArrayColl();
  }
}
