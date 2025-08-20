import type { EMail } from "../../logic/Mail/EMail";
import { MustangApp } from "../AppsBar/MustangApp";
import { openApp } from "../AppsBar/selectedApp";
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

  writeMail(mail: EMail) {
    let composerApp = new WriteMailMustangApp();
    composerApp.title = derived(mail, () => mail.subject ?? composerApp.name);
    composerApp.windowParams = { mail: mail };
    mailMustangApp.subApps.add(composerApp);
    openApp(composerApp, composerApp.windowParams);
  }

  login(tab: OAuth2Tab): LoginDialogMustangApp {
    let loginApp = new LoginDialogMustangApp();
    let account = tab.oAuth2.account;
    loginApp.title = derived(account, () => gt`Login to ${account.name}`);
    loginApp.windowParams = { dialog: tab };
    mailMustangApp.subApps.add(loginApp);
    openApp(loginApp, loginApp.windowParams);
    return loginApp;
  }
}

export const mailMustangApp = new MailMustangApp();

export class WriteMailMustangApp extends MustangApp {
  id = "mail-write";
  name = gt`Compose`;
  icon = EditIcon;
  appURL = "/mail/composer";
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
  },
};
oAuth2TabsOpen.registerObserver(tabsObserver);
(appGlobal as any)._oAuth2TabsObserver = tabsObserver; // HACK to keep it alive
