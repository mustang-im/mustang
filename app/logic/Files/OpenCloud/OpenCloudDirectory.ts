import { WebDAVDirectory } from "../WebDAV/WebDAVDirectory";
import { OpenCloudFile } from "./OpenCloudFile";
import type { OpenCloudAccount } from "./OpenCloudAccount";
import type { ArrayColl } from "svelte-collections";

export class OpenCloudDirectory extends WebDAVDirectory {
  declare account: OpenCloudAccount;
  declare readonly files: ArrayColl<OpenCloudFile>;
  declare readonly subDirs: ArrayColl<OpenCloudDirectory>;

  newDirectory(name: string, dir = new OpenCloudDirectory()): OpenCloudDirectory {
    return super.newDirectory(name, dir) as OpenCloudDirectory;
  }

  newFile(name: string, file = new OpenCloudFile()): OpenCloudFile {
    return super.newFile(name, file) as OpenCloudFile;
  }
}
