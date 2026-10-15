import '../frontend/app.css';
import './app.css';
import { mount } from 'svelte';
import MainWindow from './MainWindow/MainWindow.svelte';
import { WindowSettings } from './MainWindow/WindowSettings';
import { appName, appVersion, production } from '../logic/build';
import { catchErrors } from '../frontend/Util/error';
import * as Sentry from "@sentry/svelte";

// <copied from="../frontend/main.ts">
if (production) {
  Sentry.init({
    dsn: "https://dade72a5be5a4a84a3171531b279181a@errorlog.parula.app/3",
    release: appName + "@" + appVersion,
    // An array here would *add* to the default integrations, not replace them.
    // `BrowserSession` sends a session to the server on every navigation.
    integrations: defaults => defaults.filter(integration => integration.name != "BrowserSession"),
  });
}

const app = mount(MainWindow, {
  target: document.getElementById('app'),
});

export default app;
// </copied>

window.addEventListener("DOMContentLoaded", () => catchErrors(() => new WindowSettings().load(), console.error), false);
