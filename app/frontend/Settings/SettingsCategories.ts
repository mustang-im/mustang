import { SettingsCategory, AccountSettingsCategory as AccSetting } from "./Window/SettingsCategory";
import { mailMustangApp } from "../Mail/MailMustangApp";
import { webAppsMustangApp } from "../WebApps/WebAppsMustangApp";
import { meetMustangApp } from "../Meet/MeetMustangApp";
import { contactsMustangApp } from "../Contacts/ContactsMustangApp";
import { calendarMustangApp } from "../Calendar/CalendarMustangApp";
import { chatMustangApp } from "../Chat/ChatMustangApp";
import { appGlobal } from "../../logic/app";
import Appearance from "./Mail/Appearance.svelte";
import AccountGeneral from "./AccountGeneral.svelte";
import AccountURLServer from "./AccountURLServer.svelte";
import AccountMailServer from "./Mail/Account/Server.svelte";
import AccountFolders from "./Mail/Account/Folders.svelte";
import AccountIdentity from "./Mail/Account/Identity.svelte";
import AccountXMPPServer from "./Chat/AccountXMPPServer.svelte";
import Devices from "./Meet/Devices.svelte";
import About from "./About/About.svelte";
import Licenses from "./About/Licenses.svelte";
import Test from "./About/Test.svelte";
import SetupMail from "./Setup/Mail/SetupMail.svelte";
import SetupChat from "./Setup/Chat/SetupChat.svelte";
import SetupCalendar from "./Setup/Calendar/SetupCalendar.svelte";
import SetupContacts from "./Setup/Contacts/SetupContacts.svelte";
import SetupMeetAccount from "./Setup/Meet/SetupMeetAccount.svelte";
import { Account } from "../../logic/Abstract/Account";
import { MailAccount } from "../../logic/Mail/MailAccount";
import { XMPPAccount } from "../../logic/Chat/XMPP/XMPPAccount";
import { MatrixAccount } from "../../logic/Chat/Matrix/MatrixAccount";
import { M3Account } from "../../logic/Meet/M3Account";
import { ArrayColl } from "svelte-collections";
import { ChatAccount } from "../../logic/Chat/ChatAccount";

export const settingsCategories = new ArrayColl<SettingsCategory>();
export const accountSettings = new ArrayColl<AccSetting>();

accountSettings.add(new AccSetting(Account, "acc-general", "General", AccountGeneral, true));

const mailSettings = new SettingsCategory("mail", "Mail", null, true);
mailSettings.subCategories.addAll([
  new SettingsCategory("mail-appearance", "Appearance", Appearance),
]);
mailSettings.accounts = appGlobal.emailAccounts;
mailSettings.newAccountUI = SetupMail;
mailSettings.forApp = mailMustangApp;
settingsCategories.add(mailSettings);

accountSettings.add(new AccSetting(MailAccount, "mail-server", "Server", AccountMailServer));
accountSettings.add(new AccSetting(MailAccount, "mail-folders", "Folders", AccountFolders));
accountSettings.add(new AccSetting(MailAccount, "mail-identity", "Identity", AccountIdentity));
accountSettings.add(new AccSetting(MailAccount, "mail-send", "Send", null));
accountSettings.add(new AccSetting(MailAccount, "mail-copies", "Copies", null));

const chatSettings = new SettingsCategory("chat", "Chat", null, true);
chatSettings.subCategories.addAll([
  new SettingsCategory("chat-appearance", "Appearance"),
]);
chatSettings.accounts = appGlobal.chatAccounts;
chatSettings.newAccountUI = SetupChat;
chatSettings.forApp = chatMustangApp;
settingsCategories.add(chatSettings);

accountSettings.add(new AccSetting(XMPPAccount, "xmpp-server", "Server", AccountXMPPServer));
accountSettings.add(new AccSetting(MatrixAccount, "matrix-server", "Server", AccountURLServer));
accountSettings.add(new AccSetting(ChatAccount, "chat-send", "Send", null));
accountSettings.add(new AccSetting(ChatAccount, "chat-identity", "Identity", null));

const calendarSettings = new SettingsCategory("calendar", "Calendar", null, true);
calendarSettings.subCategories.addAll([
]);
calendarSettings.accounts = appGlobal.calendars;
calendarSettings.newAccountUI = SetupCalendar;
calendarSettings.forApp = calendarMustangApp;
settingsCategories.add(calendarSettings);

const contactsSettings = new SettingsCategory("contacts", "Contacts", null, true);
contactsSettings.subCategories.addAll([
]);
contactsSettings.accounts = appGlobal.addressbooks;
contactsSettings.newAccountUI = SetupContacts;
contactsSettings.forApp = contactsMustangApp;
settingsCategories.add(contactsSettings);

const meetSettings = new SettingsCategory("meet", "Meet", null, true);
meetSettings.subCategories.addAll([
  new SettingsCategory("meet-appearance", "Appearance"),
  new SettingsCategory("meet-devices", "Devices", Devices),
]);
meetSettings.accounts = appGlobal.meetAccounts;
meetSettings.newAccountUI = SetupMeetAccount;
meetSettings.forApp = meetMustangApp;
settingsCategories.add(meetSettings);

accountSettings.add(new AccSetting(M3Account, "m3-server", "Server", AccountURLServer, true));

const appSettings = new SettingsCategory("app", "App integration", null, true);
appSettings.subCategories.addAll([
]);
appSettings.forApp = webAppsMustangApp;
settingsCategories.add(appSettings);

const customer = new SettingsCategory("customer", "Billing", null, true);
customer.subCategories.addAll([
]);
settingsCategories.add(customer);

const about = new SettingsCategory("about", "About", About, true);
about.subCategories.addAll([
  new SettingsCategory("license", "Open-Source", Licenses),
  new SettingsCategory("test", "Test", Test),
]);
settingsCategories.add(about);
