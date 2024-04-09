import { SettingsCategory } from "./SettingsCategory";
import { appGlobal } from "../../../logic/app";
import Appearance from "../Mail/Appearance.svelte";
import AccountGeneral from "../AccountGeneral.svelte";
import AccountServer from "../Mail/AccountServer.svelte";
import AccountIdentity from "../Mail/AccountIdentity.svelte";
import Licenses from "../About/Licenses.svelte";
import About from "../About/About.svelte";
import SetupMail from "../Setup/Mail/SetupMail.svelte";
import SetupChat from "../Setup/Chat/SetupChat.svelte";
import { ArrayColl } from "svelte-collections";

const mailSettings = new SettingsCategory("mail", "Mail", false, true);
mailSettings.subCategories.addAll([
  new SettingsCategory("mail-appearance", "Appearance", false, false, Appearance),
  new SettingsCategory("mail-acc-general", "General", true, true, AccountGeneral),
  new SettingsCategory("mail-acc-server", "Server", true, false, AccountServer),
  new SettingsCategory("mail-acc-identity", "Identity", true, false, AccountIdentity),
  new SettingsCategory("mail-acc-send", "Send", true),
  new SettingsCategory("mail-acc-copies", "Copies", true),
]);
mailSettings.accounts = appGlobal.emailAccounts;
mailSettings.newAccountUI = SetupMail;

const chatSettings = new SettingsCategory("chat", "Chat", false, true);
chatSettings.subCategories.addAll([
  new SettingsCategory("chat-appearance", "Appearance", false),
  new SettingsCategory("chat-acc-general", "General", true, true, AccountGeneral),
  new SettingsCategory("chat-acc-server", "Server", true),
  new SettingsCategory("chat-acc-send", "Send", true),
  new SettingsCategory("chat-acc-identity", "Identity", true),
]);
chatSettings.accounts = appGlobal.chatAccounts;
chatSettings.newAccountUI = SetupChat;

const calendarSettings = new SettingsCategory("calendar", "Calendar", false, true);
calendarSettings.subCategories.addAll([
  new SettingsCategory("calendar-acc-general", "General", true, true, AccountGeneral),
]);
calendarSettings.accounts = appGlobal.calendars;

const contactsSettings = new SettingsCategory("contacts", "Contacts", false, true);
contactsSettings.subCategories.addAll([
  new SettingsCategory("contacts-acc-general", "General", true, true, AccountGeneral),
]);
contactsSettings.accounts = appGlobal.addressbooks;

const meetSettings = new SettingsCategory("meet", "Meet", false, true);
meetSettings.subCategories.addAll([
  new SettingsCategory("meet-acc-general", "General", true, true, AccountGeneral),
]);

const appSettings = new SettingsCategory("app", "App integration", false, true);
appSettings.subCategories.addAll([
]);

const customer = new SettingsCategory("customer", "Billing", false, true);
customer.subCategories.addAll([
]);

const about = new SettingsCategory("about", "About", false, true, About);
about.subCategories.addAll([
  new SettingsCategory("license", "Open-Source", false, false, Licenses),
]);

export const settingsCategories = new ArrayColl<SettingsCategory>([
  mailSettings,
  chatSettings,
  meetSettings,
  calendarSettings,
  contactsSettings,
  appSettings,
  customer,
  about,
]);
