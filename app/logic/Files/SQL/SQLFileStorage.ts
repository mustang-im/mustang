import type { FileSharingAccount, FileStorage } from "../FileSharingAccount";
import type { Directory } from "../Directory";
import type { File } from "../File";
import { SQLFileSharingAccount } from "./SQLFileSharingAccount";
import { SQLDirectory } from "./SQLDirectory";
import { SQLFile } from "./SQLFile";
import { ArrayColl, type Collection } from "svelte-collections";

/**
 * SQL storage for FileSharingAccount, Directory, and File *metadata*.
 * File contents are intentionally NOT persisted — bytes come from the protocol
 * (e.g. WebDAVFile.download()) on demand.
 */
export class SQLFileStorage implements FileStorage {
  async saveAccount(account: FileSharingAccount): Promise<void> {
    await SQLFileSharingAccount.save(account);
  }
  async deleteAccount(account: FileSharingAccount): Promise<void> {
    await SQLFileSharingAccount.deleteIt(account);
  }

  async readDirectoryHierarchy(account: FileSharingAccount): Promise<void> {
    await SQLDirectory.readAllHierarchy(account);
  }
  async saveDirectory(directory: Directory): Promise<void> {
    await SQLDirectory.save(directory);
  }
  async deleteDirectory(directory: Directory): Promise<void> {
    await SQLDirectory.deleteIt(directory);
  }

  async readFile(file: File): Promise<void> {
    if (file.dbID) {
      await SQLFile.read(file.dbID as number, file);
    }
  }
  /** File contents are not in the DB. The caller should use file.download() instead. */
  async readFileContent(file: File): Promise<void> {
  }
  async saveFile(file: File): Promise<void> {
    await SQLFile.save(file);
  }
  async saveFiles(files: Collection<File>): Promise<void> {
    for (let file of files) {
      await SQLFile.save(file);
    }
  }
  /** File tags are not persisted yet. */
  async saveFileTags(file: File): Promise<void> {
  }
  async deleteFile(file: File): Promise<void> {
    await SQLFile.deleteIt(file);
  }
  async readAllFiles(directory: Directory): Promise<ArrayColl<File>> {
    await SQLFile.readAll(directory);
    return new ArrayColl(directory.files.contents);
  }
}
