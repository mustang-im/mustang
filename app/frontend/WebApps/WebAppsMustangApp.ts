import { MustangApp } from "../AppsBar/MustangApp";
import { appGlobal } from "../../logic/app";
import type AppListed from "../../logic/Apps/AppListed";
import AppsApp from "./WebAppsApp.svelte";
import appsLauncherIcon from '../asset/icon/appBar/appsLauncher.svg?raw';
import { gt } from "../../l10n/l10n";

export class WebAppsMustangApp extends MustangApp {
  id = "webapps";
  name = gt`Apps`;
  icon = appsLauncherIcon;
  mainWindow = AppsApp;
  subApps = appGlobal.apps.myApps.map(app => new WebAppSubMustangApp(app));
}

export const webAppsMustangApp = new WebAppsMustangApp();

export class WebAppSubMustangApp extends MustangApp {
  constructor(webApp: AppListed) {
    super();
    this.id = webApp.id;
    this.name = webApp.nameTranslated;
    this.icon = wrapPNGinSVG(webApp.icon);
  }
}

function wrapPNGinSVG(imageURL: string): string {
  return `<svg><image href=${imageURL} height="100%" width="100%" /></svg>`;
}
