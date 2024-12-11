// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { MustangApp } from "../AppsBar/MustangApp";
import { appGlobal } from "../../logic/app";
import type WebAppListed from "../../logic/WebApps/WebAppListed";
import AppsApp from "./WebAppsApp.svelte";
import appsLauncherIcon from '../asset/icon/appBar/appsLauncher.svg?raw';
import { gt } from "../../l10n/l10n";

export class WebAppsMustangApp extends MustangApp {
  id = "webapps";
  name = gt`Apps`;
  icon = appsLauncherIcon;
  mainWindow = AppsApp;
  subApps = appGlobal.webApps.myApps.map(app => new WebAppSubMustangApp(app));
}

export const webAppsMustangApp = new WebAppsMustangApp();

export class WebAppSubMustangApp extends MustangApp {
  constructor(webApp: WebAppListed) {
    super();
    this.id = webApp.id;
    this.name = webApp.nameTranslated;
    this.icon = wrapPNGinSVG(webApp.icon);
  }
}

function wrapPNGinSVG(imageURL: string): string {
  return `<svg><image href=${imageURL} height="100%" width="100%" /></svg>`;
}
