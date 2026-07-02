import { NotImplemented } from "util/util";
import { kyCreate } from "../../../lib/util/ky";
import ky from "ky";

/** Implements the same functions as desktop/backend/backend.ts ,
 * but for the web browser.
 * Some of the functions are disabled in this case.
 */
export class WebMailBackend {
  /** HTTP requests. See `kyCreate()` in lib/util/ky.ts */
  async kyCreate(defaultOptions: any): Promise<any> {
    return kyCreate(ky, defaultOptions);
  }
  async isOSNotificationSupported(): Promise<boolean> {
    return false;
  }
  async newTrayIcon() {
  }
  async setBadgeCount() {
  }
  async minimizeMainWindow() {
  }
  async unminimizeMainWindow() {
  }
  async maximizeMainWindow() {
  }
  async writeTextToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
  async openExternalURL(url: string) {
    window.open(url, "_blank", "noopener, noreferrer");
  }
  async openFileInNativeApp(filePath: string) {
    let url = "file://" + filePath;
    window.open(url, "_blank", "noopener");
  }
  async showFileInFolder(filePath: string) {
    throw new NotImplemented("Cannot open file path in browser");
  }
  async restartApp() {
    window.location.reload();
  }
  async setTheme() {
  }
}
