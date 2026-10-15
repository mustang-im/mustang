import { appGlobal } from "../../logic/app";
import { getLocalStorage } from "../../frontend/Util/LocalStorage";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { assert } from "../../logic/util/util";
import { gt } from "../../l10n/l10n";

export class WindowSettings {
  load() {
    // <copied from="../../frontend/main.ts">
    let windowSize = getLocalStorage("window.size", []).value;
    try {
      assert(windowSize?.length == 2 && windowSize.every(i => sanitize.integer(i, -1) > 0), "Bad window size");
      windowSize[0] = Math.min(windowSize[0], screen.width);
      windowSize[1] = Math.min(windowSize[1], screen.height);
      window.resizeTo(windowSize[0], windowSize[1]);
    } catch (ex) {
      throw gt`Bad window size: ` + windowSize;
    }

    let windowPosition = getLocalStorage("window.position", []).value;
    try {
      assert(windowPosition?.length == 2 && windowPosition.every(i => sanitize.integer(i, null) != null), "Bad window position");
      window.moveTo(windowPosition[0], windowPosition[1]);
    } catch (ex) {
      throw gt`Bad window position: ` + windowPosition;
    }
    // </copied>
  }

  save() {
    // <copied from="../../frontend/MainWindow/MainWindow.svelte">
    if (appGlobal.isMobile || document.hidden) {
      return;
    }
    let windowSizeSetting = getLocalStorage("window.size", []);
    let windowPositionSetting = getLocalStorage("window.position", []);
    windowSizeSetting.value = [ window.outerWidth, window.outerHeight ];
    windowPositionSetting.value = [ window.screenX, window.screenY ];
    // </copied>
  }
}
