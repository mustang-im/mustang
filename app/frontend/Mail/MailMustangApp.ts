import type { EMail } from "../../logic/Mail/Message";
import { MustangApp } from "../AppsBar/MustangApp";
import { openApp } from "../AppsBar/selectedApp";
import MailApp from "./MailApp.svelte";
import MailComposer from "./Composer/MailComposer.svelte";
import mailIcon from '../asset/icon/appBar/mail.svg?raw';
import EditIcon from "lucide-svelte/icons/pencil";

export class MailMustangApp extends MustangApp {
  id = "mail";
  name = "Mail";
  icon = mailIcon;
  mainWindow = MailApp;

  writeMail(mail: EMail) {
    let edit = new WriteMailMustangApp();
    edit.mainWindowProperties = {
      mail: mail,
    };
    mailMustangApp.subApps.add(edit);
    openApp(edit);
  }
}

export class WriteMailMustangApp extends MustangApp {
  id = "mail-write";
  name = "Compose";
  icon = EditIcon;
  mainWindow = MailComposer;
}

export const mailMustangApp = new MailMustangApp();
