import { SettingsCategory } from "./SettingsCategory";
import { appGlobal } from "../../../logic/app";
import AccountGeneral from "../Mail/AccountGeneral.svelte";
import AccountServer from "../Mail/AccountServer.svelte";
import AccountIdentity from "../Mail/AccountIdentity.svelte";
import SetupMail from "../../Setup/Mail/SetupMail.svelte";
import { ArrayColl } from "svelte-collections";

const mailSettings = new SettingsCategory("mail", "Mail");
mailSettings.subCategories.addAll([
  new SettingsCategory("mail-appearance", "Appearance", false),
  new SettingsCategory("mail-general", "General", true, true, AccountGeneral),
  new SettingsCategory("mail-server", "Server", true, false, AccountServer),
  new SettingsCategory("mail-send", "Identity", true, false, AccountIdentity),
  new SettingsCategory("mail-send", "Send", true),
  new SettingsCategory("mail-send", "Copies", true),
]);
mailSettings.accounts = appGlobal.emailAccounts;
mailSettings.newAccountUI = SetupMail;

const chatSettings = new SettingsCategory("chat", "Chat");
chatSettings.subCategories.addAll([
  new SettingsCategory("chat-appearance", "Appearance", false),
  new SettingsCategory("chat-server", "Server", true),
  new SettingsCategory("chat-send", "Send", true),
  new SettingsCategory("chat-identity", "Identity", true),
]);
chatSettings.accounts = appGlobal.chatAccounts;

const calendarSettings = new SettingsCategory("calendar", "Calendar");
calendarSettings.subCategories.addAll([
]);
calendarSettings.accounts = appGlobal.calendars;

const contactsSettings = new SettingsCategory("contacts", "Contacts");
contactsSettings.subCategories.addAll([
]);
contactsSettings.accounts = appGlobal.addressbooks;

const meetSettings = new SettingsCategory("meet", "Meet");
meetSettings.subCategories.addAll([
]);

const appSettings = new SettingsCategory("app", "App integration");
meetSettings.subCategories.addAll([
]);

const about = new SettingsCategory("about", "About");
about.subCategories.addAll([
]);

export const settingsCategories = new ArrayColl<SettingsCategory>([
  mailSettings,
  chatSettings,
  meetSettings,
  calendarSettings,
  contactsSettings,
  appSettings,
  about,
]);
