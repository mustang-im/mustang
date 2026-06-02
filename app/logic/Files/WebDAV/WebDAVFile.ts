import { File } from "../File";
import type { WebDAVDirectory } from "./WebDAVDirectory";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { URLString } from "../../util/util";
import type { FileStat } from "webdav";

export class WebDAVFile extends File {
  declare parent: WebDAVDirectory;
  /** URL of the file on the WebDAV server.
   * Can HTTP GET, but only with auth headers, not loadable from the frontend. */
  serverURL: URLString | null = null;

  get account() {
    return this.parent?.account;
  }

  get etag(): string | null {
    return this.syncState as string;
  }
  set etag(val: string | null) {
    this.syncState = val;
  }

  fromStat(stat: FileStat) {
    this.path = sanitize.nonemptystring(stat.filename);
    this.setFileName(sanitize.filename(stat.basename));
    this.size = sanitize.integer(stat.size, 0);
    this.mimetype = sanitize.nonemptystring(stat.mime, this.mimetype ?? "");
    this.etag = sanitize.nonemptystring(stat.etag, null);
    this.lastMod = sanitize.date(stat.lastmod, new Date());
    this.serverURL = sanitize.url(new URL(this.path, this.account.url).href, null);
  }

  async download() {
    if (this.contents) {
      return;
    }
    await this.downloadRunOnce.runOnce(async () => {
      if (this.contents) {
        return;
      }
      await this.account.login(false);
      let buf = await this.account.client.getFileContents(this.path, { format: "binary" }) as ArrayBuffer;
      this.contents = new Blob([buf], this.mimetype ? { type: this.mimetype } : undefined);
    });
  }

  async saveContents(contents: Blob) {
    await this.account.login(false);
    let bytes = await contents.arrayBuffer();
    let headers: Record<string, string> = {};
    if (this.etag) {
      headers["If-Match"] = this.etag;
    }
    await this.account.client.putFileContents(this.path, bytes, {
      overwrite: true,
      headers,
    });
    this.clearURL();
    this.contents = contents;
    await this.stat();
    await this.save();
  }

  /** Refresh metadata for this file from the server.
   * WebDAV: PROPFIND on the single file. */
  async stat() {
    await this.account.login(false);
    let stat = await this.account.client.stat(this.path) as FileStat;
    this.fromStat(stat);
  }

  async deleteIt() {
    await this.account.login(false);
    if (this.parent) {
      this.parent.files.remove(this);
    }
    this.clearURL();
    await this.account.client.deleteFile(this.path);
    await this.account?.storage?.deleteFile(this);
  }
}
