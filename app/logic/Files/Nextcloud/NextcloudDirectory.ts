import { WebDAVDirectory } from "../WebDAV/WebDAVDirectory";
import { NextcloudFile } from "./NextcloudFile";
import type { NextcloudAccount } from "./NextcloudAccount";
import type { ArrayColl } from "svelte-collections";

export class NextcloudDirectory extends WebDAVDirectory {
  declare account: NextcloudAccount;
  declare readonly files: ArrayColl<NextcloudFile>;
  declare readonly subDirs: ArrayColl<NextcloudDirectory>;

  newDirectory(name: string, dir = new NextcloudDirectory()): NextcloudDirectory {
    return super.newDirectory(name, dir) as NextcloudDirectory;
  }

  newFile(name: string, file = new NextcloudFile()): NextcloudFile {
    return super.newFile(name, file) as NextcloudFile;
  }
}
