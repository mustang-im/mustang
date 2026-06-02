import { WebDAVFile } from "../WebDAV/WebDAVFile";
import type { NextcloudDirectory } from "./NextcloudDirectory";

export class NextcloudFile extends WebDAVFile {
  declare parent: NextcloudDirectory;
}
