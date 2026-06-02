import { FileOrDirectory } from "./FileOrDirectory";
import { appGlobal } from "../app";
import { RunOnce } from "../util/flow/RunOnce";
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
  protected readonly downloadRunOnce = new RunOnce<void>();
  protected readonly getURLRunOnce = new RunOnce<URLString | null>();

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

  /** Refresh metadata for this file from the source. */
  async stat() {
  }

  get isDownloaded(): boolean {
    return !!this.contents;
  }

  async download() {
    if (this.contents) {
      return;
    }
    await this.downloadRunOnce.runOnce(async () => {
      if (this.contents) {
        return;
      }
      if (this.filepathLocal) {
        this.contents = await appGlobal.remoteApp.fs.readFile(this.filepathLocal);
      } else {
        throw new NotImplemented("Download of remote file not yet implemented");
      }
    });
  }

  async getURL(): Promise<URLString | null> {
    if (this.url) {
      return this.url;
    }
    return await this.getURLRunOnce.runOnce(async () => {
      if (this.url) {
        return this.url;
      }
      await this.download();
      if (!this.contents) {
        return null;
      }
      return this.url = await blobToDataURL(this.contents);
    });
  }

  /** Open the native desktop app with this file */
  async openOSApp() {
    await openOSAppForFile(this.filepathLocal);
  }
}
