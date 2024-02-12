import { MustangApp } from "../AppsBar/MustangApp";
import ContactsApp from "./ContactsApp.svelte";
import contactsIcon from '../asset/icon/appBar/contacts.svg?raw';

export class ContactsMustangApp extends MustangApp {
  id = "contacts";
  name = "Contacts";
  icon = contactsIcon;
  mainWindow = ContactsApp;
}

export const contactsMustangApp = new ContactsMustangApp();
