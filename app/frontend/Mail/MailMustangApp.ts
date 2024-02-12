import { MustangApp } from "../AppsBar/MustangApp";
import MailApp from "./MailApp.svelte";
import mailIcon from '../asset/icon/appBar/mail.svg?raw';

export class MailMustangApp extends MustangApp {
  id = "mail";
  name = "Mail";
  icon = mailIcon;
  mainWindow = MailApp;
}

export const mailMustangApp = new MailMustangApp();
