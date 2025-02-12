import { NotImplemented } from "util/util";
import ky from "ky";

/** Implements the same functions as backend/backend.ts ,
 * but for the web browser.
 * Some of the functions are disabled in this case.
 */
export class WebMailBackend {
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
  async writeTextToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
  async openExternalURL(url: string) {
    window.open(url, "_blank", "noopener");
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
