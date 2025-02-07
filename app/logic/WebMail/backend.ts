import { NotImplemented } from "util/util";

/** Implements the same functions as backend/backend.ts ,
 * but for the web browser.
 * Some of the functions are disabled in this case.
 */
export class WebMailBackend {
  kyCreate() {
  }
  isOSNotificationSupported(): boolean {
    return false;
  }
  newTrayIcon() {
  }
  setBadgeCount() {
  }
  minimizeMainWindow() {
  }
  unminimizeMainWindow() {
  }
  writeTextToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
  openExternalURL(url: string) {
    window.open(url, "_blank", "noopener");
  }
  openFileInNativeApp(filePath: string) {
    let url = "file://" + filePath;
    window.open(url, "_blank", "noopener");
  }
  showFileInFolder(filePath: string) {
    throw new NotImplemented("Cannot open file path in browser");
  }
  restartApp() {
    window.location.reload();
  }
  setTheme() {
  }
}
