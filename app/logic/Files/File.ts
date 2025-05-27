import { FileOrDirectory } from "./FileOrDirectory";
import { appGlobal } from "../app";

export class File extends FileOrDirectory {
  nameWithoutExt: string; /** substring of `name`, excluding `fileExt` and dot */
  ext: string; /** substring of `name`, just the part after the last dot */
  mimetype: string;
  size: number; /* in bytes */
  contents: Blob; /** may be undefined = not loaded. Does not mean that the file is empty. */

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

  async download() {
  }

  /** Open the native desktop app with this file */
  async openOSApp() {
    await appGlobal.remoteApp.openFileInNativeApp(this.filepathLocal);
  }
}
