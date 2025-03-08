import './app.css';
import MainWindow from './MainWindow/MainWindow.svelte';
import { appName, appVersion, production } from '../logic/build';
import { getLocalStorage } from './Util/LocalStorage';
import { sanitize } from '../../lib/util/sanitizeDatatypes';
import { assert } from '../logic/util/util';
import { catchErrors } from './Util/error';
import { gt } from '../l10n/l10n';
import * as Sentry from "@sentry/svelte";

if (production) {
  Sentry.init({
    dsn: "https://7fc67f1156f0ea94c98a4ec5030f24fc@o4507566955757568.ingest.de.sentry.io/4507566958313552",
    release: appName + "@" + appVersion,
    integrations: [],
  });
}

const app = new MainWindow({
  target: document.getElementById('app'),
});

export default app;

function loadWindowSettings() {
  let windowSize = getLocalStorage("window.size", [window.outerWidth, window.outerHeight]).value;
  let windowPosition = getLocalStorage("window.position", [window.screenX, window.screenY]).value;
  assert(windowSize.length == 2 && windowSize.every(i => sanitize.integer(i)), gt`Bad window size` + windowSize);
  assert(windowPosition.length == 2 && windowPosition.every(i => sanitize.integer(i)),  gt`Bad window position` + windowPosition);
  window.resizeTo(windowSize[0], windowSize[1]);
  window.moveTo(windowPosition[0], windowPosition[1]);
}
window.addEventListener("DOMContentLoaded", () => catchErrors(loadWindowSettings, console.error), false);
