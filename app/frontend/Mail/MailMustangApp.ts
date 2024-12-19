import type { EMail } from "../../logic/Mail/EMail";
import { MustangApp } from "../AppsBar/MustangApp";
import { openApp } from "../AppsBar/selectedApp";
import { OAuth2Tab, oAuth2TabsOpen } from "../../logic/Auth/UI/OAuth2Tab";
import { appGlobal } from "../../logic/app";
import MailApp from "./MailApp.svelte";
import MailComposer from "./Composer/MailComposer.svelte";
import OAuth2EmbeddedBrowser from "../Shared/Auth/OAuth2EmbeddedBrowser.svelte";
import mailIcon from '../asset/icon/appBar/mail.svg?raw';
import EditIcon from "lucide-svelte/icons/pencil";
import AuthIcon from "lucide-svelte/icons/key-round";
import { derived } from "svelte/store";
import { gt } from "../../l10n/l10n";

export class MailMustangApp extends MustangApp {
  id = "mail";
  name = gt`Mail`;
  icon = mailIcon;
  mainWindow = MailApp;

  writeMail(mail: EMail) {
    let composerApp = new WriteMailMustangApp();
    composerApp.title = derived(mail, () => mail.subject ?? composerApp.name);
    composerApp.mainWindowProperties = {
      mail: mail,
    };
    mailMustangApp.subApps.add(composerApp);
    openApp(composerApp);
  }

  login(tab: OAuth2Tab): LoginDialogMustangApp {
    let loginApp = new LoginDialogMustangApp();
    let account = tab.oAuth2.account;
    loginApp.title = derived(account, () => gt`Login to ${account.name}`);
    loginApp.mainWindowProperties = {
      dialog: tab,
    };
    mailMustangApp.subApps.add(loginApp);
    openApp(loginApp);
    return loginApp;
  }
}

export const mailMustangApp = new MailMustangApp();

export class WriteMailMustangApp extends MustangApp {
  id = "mail-write";
  name = gt`Compose`;
  icon = EditIcon;
  mainWindow = MailComposer;
}

export class LoginDialogMustangApp extends MustangApp {
  id = "auth-login";
  name = gt`Login`;
  icon = AuthIcon;
  mainWindow = OAuth2EmbeddedBrowser;
}

const tabsObserver = {
  added(tabs: OAuth2Tab[]) {
    for (let tab of tabs) {
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
