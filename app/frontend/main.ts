import './app.css';
import { mount } from 'svelte';
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

const app = mount(MainWindow, {
  target: document.getElementById('app'),
});

export default app;

function loadWindowSettings() {
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
}
window.addEventListener("DOMContentLoaded", () => catchErrors(loadWindowSettings, console.error), false);
