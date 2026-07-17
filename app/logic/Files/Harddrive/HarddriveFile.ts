import { File } from "../File";
import { appGlobal } from "../../app";
import { assert } from "../../util/util";

export class HarddriveFile extends File {
  async download() {
    if (this.contents) {
      return;
    }
    await this.downloadRunOnce.runOnce(async () => {
      if (this.contents) {
        return;
      }
      assert(this.filepathLocal, "Download of remote file not yet implemented");
      this.contents = await appGlobal.remoteApp.fs.readFile(this.filepathLocal);
    });
  }
}
