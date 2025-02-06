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
    shell = new WebMailShell();
    restartApp() {
      window.location.reload();
    }
    setTheme() {
    }
}

class WebMailShell {
  openExternal(url: string) {
    window.open(url, "_blank", "noopener");
  }
  openPath(filePath: string) {
    throw new NotImplemented("Cannot open file path in browser");
  }
}
