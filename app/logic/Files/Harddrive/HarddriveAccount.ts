import { FileSharingAccount } from "../FileSharingAccount";
import { HarddriveDirectory } from "./HarddriveDirectory";
import { appGlobal } from "../../app";
import { gt } from "../../../l10n/l10n";

export class HarddriveAccount extends FileSharingAccount {
  readonly protocol: string = "harddrive";
  name = gt`My computer`;

  get isLoggedIn(): boolean {
    return true;
  }

  newDirectory(name: string): HarddriveDirectory {
    let dir = new HarddriveDirectory();
    dir.name = name;
    dir.account = this;
    dir.parent = null;
    return dir;
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
    let dir = this.newDirectory(label);
    dir.path = dir.filepathLocal = path;
    this.rootDirs.add(dir);
  }

  protected async addSpecialDir(label: string, dirname: string) {
    try {
      let path = await appGlobal.remoteApp.directory(dirname);
      let entries = await appGlobal.remoteApp.listDirectoryContents(path, false);
      if (!entries?.length) {
        return;
      }
      this.addRootDir(label, path);
    } catch (ex) {
      this.errorCallback(ex);
    }
  }
}

export const myHarddrive = new HarddriveAccount();
