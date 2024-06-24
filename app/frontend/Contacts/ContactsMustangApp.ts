import { MustangApp } from "../AppsBar/MustangApp";
import ContactsApp from "./ContactsApp.svelte";
import contactsIcon from '../asset/icon/appBar/contacts.svg?raw';
import { gt } from "svelte-i18n-lingui";

export class ContactsMustangApp extends MustangApp {
  id = "contacts";
  name = gt("Contacts");
  icon = contactsIcon;
  mainWindow = ContactsApp;
}

export const contactsMustangApp = new ContactsMustangApp();
