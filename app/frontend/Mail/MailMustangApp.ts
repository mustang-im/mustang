import type { EMail } from "../../logic/Mail/EMail";
import { MustangApp } from "../AppsBar/MustangApp";
import { openApp } from "../AppsBar/selectedApp";
import { OAuth2Dialog, oAuth2DialogOpen } from "../../logic/Auth/OAuth2Dialog";
import MailApp from "./MailApp.svelte";
import MailComposer from "./Composer/MailComposer.svelte";
import OAuth2DialogUI from "../Shared/Auth/OAuth2DialogUI.svelte";
import mailIcon from '../asset/icon/appBar/mail.svg?raw';
import EditIcon from "lucide-svelte/icons/pencil";
import AuthIcon from "lucide-svelte/icons/key-round";
import { derived } from "svelte/store";

export class MailMustangApp extends MustangApp {
  id = "mail";
  name = "Mail";
  icon = mailIcon;
  mainWindow = MailApp;

  writeMail(mail: EMail) {
    let edit = new WriteMailMustangApp();
    edit.title = derived(mail, () => mail.subject ?? edit.name);
    edit.mainWindowProperties = {
      mail: mail,
    };
    mailMustangApp.subApps.add(edit);
    openApp(edit);
  }

  login(dialog: OAuth2Dialog): LoginDialogMustangApp {
    let loginApp = new LoginDialogMustangApp();
    loginApp.mainWindowProperties = {
      dialog: dialog,
    };
    mailMustangApp.subApps.add(loginApp);
    openApp(loginApp);
    return loginApp;
  }
}

export class WriteMailMustangApp extends MustangApp {
  id = "mail-write";
  name = "Compose";
  icon = EditIcon;
  mainWindow = MailComposer;
}

export class LoginDialogMustangApp extends MustangApp {
  id = "auth-login";
  name = "Login";
  icon = AuthIcon;
  mainWindow = OAuth2DialogUI;
}

export const mailMustangApp = new MailMustangApp();

oAuth2DialogOpen.registerObserver({
  added(dialogs: OAuth2Dialog[]) {
    for (let dialog of dialogs) {
      console.log("dialog added", dialog);
      dialog.mustangApp = mailMustangApp.login(dialog);
    }
  },
  removed(dialogs) {
    for (let dialog of dialogs) {
      console.log("dialog removed", dialog);
      console.log("  apps before remove", mailMustangApp.subApps.contents);
      mailMustangApp.subApps.remove(dialog.mustangApp);
      console.log("  apps after remove", mailMustangApp.subApps.contents);
    }
  },
});
