import './app.css';
import MainWindow from './MainWindow/MainWindow.svelte';
import { getLocalStorage } from './Util/LocalStorage';
import { sanitize } from '../../lib/util/sanitizeDatatypes';
import { assert } from '../logic/util/util';
import { catchErrors } from './Util/error';
import { gt } from '../l10n/l10n';

const app = new MainWindow({
  target: document.getElementById('app'),
});

export default app;

function loadWindowSettings() {
  let windowSize = getLocalStorage("window.size", [window.outerWidth, window.outerHeight]).value;
  let windowPosition = getLocalStorage("window.position", [window.screenX, window.screenY]).value;
  assert(windowSize.length == 2 && windowSize.every(i => sanitize.integer(i)), gt`Bad window size` + windowSize);
  assert(windowPosition.length == 2 && windowPosition.every(i => sanitize.integer(i)), gt`Bad window position` + windowPosition);
  windowSize[0] = Math.min(windowSize[0], screen.width);
  windowSize[1] = Math.min(windowSize[1], screen.height);
  window.resizeTo(windowSize[0], windowSize[1]);
  window.moveTo(windowPosition[0], windowPosition[1]);
}
window.addEventListener("DOMContentLoaded", () => catchErrors(loadWindowSettings, console.error), false);
