import type { EMail } from "../../logic/Mail/EMail";
import { MustangApp } from "../AppsBar/MustangApp";
import { getNavigation } from "../AppsBar/selectedApp";
import { AppWindow } from "../MainWindow/AppWindow";
import ComposerWindow from "./Composer/ComposerWindow.svelte";
import { OAuth2Tab, oAuth2TabsOpen } from "../../logic/Auth/UI/OAuth2Tab";
import { appGlobal } from "../../logic/app";
import mailIcon from '../asset/icon/appBar/mail.svg?raw';
import EditIcon from "lucide-svelte/icons/pencil";
import AuthIcon from "lucide-svelte/icons/key-round";
import { derived } from "svelte/store";
import { gt } from "../../l10n/l10n";

export class MailMustangApp extends MustangApp {
  id = "mail";
  name = gt`Mail`;
  icon = mailIcon;
  appURL = "/mail";

  /**
   * Opens the mail composer.
   * In a main window, as part of the Mail app. In other windows, in a new window.
   * @param appWindow From where the user wants to write the mail
   */
  writeMail(mail: EMail, appWindow: AppWindow) {
    if (appWindow.mainWindow != appWindow) {
      this.writeMailInNewWindow(mail, appWindow);
      return;
    }
    let composerApp = new WriteMailMustangApp();
    composerApp.title = derived(mail, () => mail.subject ?? composerApp.name);
    composerApp.windowParams = { mail: mail };
    composerApp.appWindow = appWindow;
    mailMustangApp.subApps.add(composerApp);
    getNavigation(appWindow).openApp(composerApp, composerApp.windowParams);
  }

  writeMailInNewWindow(mail: EMail, appWindow: AppWindow) {
    appWindow.open(ComposerWindow, { mail }, 1000, 800);
  }

  login(tab: OAuth2Tab): LoginDialogMustangApp {
    let loginApp = new LoginDialogMustangApp();
    let account = tab.oAuth2.account;
    loginApp.title = derived(account, () => gt`Login to ${account.name}`);
    loginApp.windowParams = { dialog: tab };
    mailMustangApp.subApps.add(loginApp);
    getNavigation(AppWindow.main).openApp(loginApp, loginApp.windowParams);
    return loginApp;
  }
}

export const mailMustangApp = new MailMustangApp();

export class WriteMailMustangApp extends MustangApp {
  id = "mail-write";
  name = gt`Compose`;
  icon = EditIcon;
  appURL = "/mail/compose";
}

export class LoginDialogMustangApp extends MustangApp {
  id = "auth-login";
  name = gt`Login`;
  icon = AuthIcon;
  appURL = "/login";
}

const tabsObserver = {
  added(tabs: OAuth2Tab[]) {
    for (let tab of tabs) {
      // TODO simplify, using URLs? But remove correctly.
      tab.mustangApp = mailMustangApp.login(tab);
    }
  },
  removed(tabs: OAuth2Tab[]) {
    for (let tab of tabs) {
      mailMustangApp.subApps.remove(tab.mustangApp);
    }
    getNavigation(AppWindow.main).openApp(mailMustangApp, {});
  },
};
oAuth2TabsOpen.registerObserver(tabsObserver);
(appGlobal as any)._oAuth2TabsObserver = tabsObserver; // HACK to keep it alive
