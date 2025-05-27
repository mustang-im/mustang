import { gt } from "../../../l10n/l10n";
import { appGlobal } from "../../app";
import { FileSharingAccount } from "../FileSharingAccount";

export class HarddriveAccount extends FileSharingAccount {
  readonly protocol: string = "harddrive";
  name = gt`My computer`;

  get isLoggedIn(): boolean {
    return true;
  }

  async sync() {
    if (this.rootDirs.isEmpty) {
      await this.init();
    }
  }

  async init() {
    let platform = await appGlobal.remoteApp.platform();
    const isWindows = platform == "win32";
    const isMac = platform == "darwin";
    const isUnix = platform == "linux" || platform == "sunos" || platform?.includes("bsd");
    const isDesktop = isWindows || isMac || isUnix;

    if (isDesktop) {
      if (isUnix) {
        this.addRootDir(gt`Root`, "/");
      }
      await this.addSpecialDir(gt`Home`, "home");
      await this.addSpecialDir(gt`Documents`, "documents");
      await this.addSpecialDir(gt`Downloads`, "downloads");
      await this.addSpecialDir(gt`Pictures`, "pictures");
      if (isWindows) {
        await this.addSpecialDir(gt`Recent`, "recent");
      }
      // TODO list drives, e.g. C: etc. - npm drivelist?
    }
  }

  protected addRootDir(label: string, path: string) {
    let dir = this.newDirectory();
    dir.name = label;
    dir.path = dir.filepathLocal = path;
    this.rootDirs.add(dir);
  }

  protected async addSpecialDir(label: string, dirname: string) {
    try {
      this.addRootDir(label, await appGlobal.remoteApp.directory(dirname));
    } catch (ex) {
      this.errorCallback(ex);
    }
  }
}

export const myHarddrive = new HarddriveAccount();
