import { WebDAVFile } from "../WebDAV/WebDAVFile";
import type { OpenCloudDirectory } from "./OpenCloudDirectory";

export class OpenCloudFile extends WebDAVFile {
  declare parent: OpenCloudDirectory;
}
