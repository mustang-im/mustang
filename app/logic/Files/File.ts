import { FileOrDirectory } from "./FileOrDirectory";
import { appGlobal } from "../app";
import { Lock } from "../util/Lock";
import { notifyChangedProperty } from "../util/Observable";
import { openOSAppForFile } from "../util/os-integration";
import { NotImplemented, blobToDataURL, type URLString } from "../util/util";

export class File extends FileOrDirectory {
  /** substring of `name`, excluding `fileExt` and dot */
  nameWithoutExt: string;
  /** substring of `name`, just the part after the last dot */
  ext: string;
  mimetype: string;
  /** in bytes */
  @notifyChangedProperty
  size: number;
  url: URLString;
  /** null/undefined = not loaded. Does not mean that the file is empty. */
  @notifyChangedProperty
  contents: Blob;
  protected readonly downloadLock = new Lock();
  protected readonly dataURLLock = new Lock();

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

  get isDownloaded(): boolean {
    return !!this.contents;
  }

  async download() {
    if (this.contents) {
      return;
    } else if (this.filepathLocal) {
      let wasLocked = this.downloadLock.haveWaiting;
      let lock = await this.downloadLock.lock();
      if (wasLocked) {
        lock.release();
        return;
      }
      try {
        this.contents = await appGlobal.remoteApp.fs.readFile(this.filepathLocal);
        console.log("got content of file", this.filepathLocal);
      } finally {
        lock.release();
      }
    } else {
      throw new NotImplemented("Download of remote file not yet implemented");
    }
  }

  async getURL(): Promise<URLString | null> {
    if (this.url) {
      return this.url;
    } else if (this.filepathLocal) {
      await this.download();
      let wasLocked = this.dataURLLock.haveWaiting;
      let lock = await this.dataURLLock.lock();
      if (wasLocked) {
        lock.release();
        return null;
      }
      try {
        return this.url = await blobToDataURL(this.contents);
      } finally {
        lock.release();
      }
    } else {
      return null;
    }
  }

  /** Open the native desktop app with this file */
  async openOSApp() {
    await openOSAppForFile(this.filepathLocal);
  }
}
