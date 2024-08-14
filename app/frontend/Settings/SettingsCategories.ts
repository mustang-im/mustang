import { SettingsCategory, AccountSettingsCategory as AccSetting } from "./Window/SettingsCategory";
import { mailMustangApp } from "../Mail/MailMustangApp";
import { webAppsMustangApp } from "../WebApps/WebAppsMustangApp";
import { meetMustangApp } from "../Meet/MeetMustangApp";
import { contactsMustangApp } from "../Contacts/ContactsMustangApp";
import { calendarMustangApp } from "../Calendar/CalendarMustangApp";
import { chatMustangApp } from "../Chat/ChatMustangApp";
import { appGlobal } from "../../logic/app";
import GlobalAppearance from "./Global/Appearance.svelte";
import MailAppearance from "./Mail/Appearance.svelte";
import MailNotifications from "./Mail/Notifications.svelte";
import MailRead from "./Mail/Read.svelte";
import MailSend from "./Mail/Send.svelte";
import MailTags from "./Mail/Tags.svelte";
import AccountGeneral from "./AccountGeneral.svelte";
import AccountURLServer from "./AccountURLServer.svelte";
import AccountMailServer from "./Mail/Account/Server.svelte";
import AccountFolders from "./Mail/Account/Folders.svelte";
import AccountIdentity from "./Mail/Account/Identity.svelte";
import AccountXMPPServer from "./Chat/AccountXMPPServer.svelte";
import ChatNotifications from "./Chat/Notifications.svelte";
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
import { gt } from "../../l10n/l10n";

export const settingsCategories = new ArrayColl<SettingsCategory>();
export const accountSettings = new ArrayColl<AccSetting>();

accountSettings.add(new AccSetting(Account, "acc-general", gt`General`, AccountGeneral, true));

const globalSettings = new SettingsCategory("global", gt`All`, null, true);
globalSettings.subCategories.addAll([
  new SettingsCategory("global-appearance", gt`Appearance`, GlobalAppearance),
]);
settingsCategories.add(globalSettings);

const mailSettings = new SettingsCategory("mail", gt`Mail`, null, true);
mailSettings.subCategories.addAll([
  new SettingsCategory("mail-appearance", gt`Appearance`, MailAppearance),
  new SettingsCategory("mail-notifications", gt`Notifications`, MailNotifications),
  new SettingsCategory("mail-read", gt`Read`, MailRead),
  new SettingsCategory("mail-send", gt`Send`, MailSend),
  new SettingsCategory("mail-send", gt`Tags`, MailTags),
]);
mailSettings.accounts = appGlobal.emailAccounts;
mailSettings.newAccountUI = SetupMail;
mailSettings.forApp = mailMustangApp;
settingsCategories.add(mailSettings);

accountSettings.add(new AccSetting(MailAccount, "mail-server", gt`Server`, AccountMailServer));
accountSettings.add(new AccSetting(MailAccount, "mail-folders", gt`Folders`, AccountFolders));
accountSettings.add(new AccSetting(MailAccount, "mail-identity", gt`Identity`, AccountIdentity));

const chatSettings = new SettingsCategory("chat", gt`Chat`, null, true);
chatSettings.subCategories.addAll([
  new SettingsCategory("chat-appearance", gt`Appearance`),
  new SettingsCategory("chat-notifications", gt`Notifications`, ChatNotifications),
]);
chatSettings.accounts = appGlobal.chatAccounts;
chatSettings.newAccountUI = SetupChat;
chatSettings.forApp = chatMustangApp;
settingsCategories.add(chatSettings);

accountSettings.add(new AccSetting(XMPPAccount, "xmpp-server", gt`Server`, AccountXMPPServer));
accountSettings.add(new AccSetting(MatrixAccount, "matrix-server", gt`Server`, AccountURLServer));
accountSettings.add(new AccSetting(ChatAccount, "chat-send", gt`Send`, null));
accountSettings.add(new AccSetting(ChatAccount, "chat-identity", gt`Identity`, null));

const calendarSettings = new SettingsCategory("calendar", gt`Calendar`, null, true);
calendarSettings.subCategories.addAll([
]);
calendarSettings.accounts = appGlobal.calendars;
calendarSettings.newAccountUI = SetupCalendar;
calendarSettings.forApp = calendarMustangApp;
settingsCategories.add(calendarSettings);

const contactsSettings = new SettingsCategory("contacts", gt`Contacts`, null, true);
contactsSettings.subCategories.addAll([
]);
contactsSettings.accounts = appGlobal.addressbooks;
contactsSettings.newAccountUI = SetupContacts;
contactsSettings.forApp = contactsMustangApp;
settingsCategories.add(contactsSettings);

const meetSettings = new SettingsCategory("meet", gt`Meet`, null, true);
meetSettings.subCategories.addAll([
  new SettingsCategory("meet-appearance", gt`Appearance`),
  new SettingsCategory("meet-devices", gt`Devices`, Devices),
]);
meetSettings.accounts = appGlobal.meetAccounts;
meetSettings.newAccountUI = SetupMeetAccount;
meetSettings.forApp = meetMustangApp;
settingsCategories.add(meetSettings);

accountSettings.add(new AccSetting(M3Account, "m3-server", gt`Server`, AccountURLServer, true));

const appSettings = new SettingsCategory("app", gt`App integration`, null, true);
appSettings.subCategories.addAll([
]);
appSettings.forApp = webAppsMustangApp;
settingsCategories.add(appSettings);

const customer = new SettingsCategory("customer", gt`Billing`, null, true);
customer.subCategories.addAll([
]);
settingsCategories.add(customer);

const about = new SettingsCategory("about", gt`About`, About, true);
about.subCategories.addAll([
  new SettingsCategory("license", gt`Open-Source`, Licenses),
  new SettingsCategory("test", gt`Test`, Test),
]);
settingsCategories.add(about);
