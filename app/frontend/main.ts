import './app.css';
import MainWindow from './MainWindow/MainWindow.svelte';
import { appName, appVersion, production } from '../logic/build';
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
