import { SettingsCategory, AccountSettingsCategory as AccSetting } from "./Window/SettingsCategory";
import { ChatAccount } from "../../logic/Chat/ChatAccount";
import { mailMustangApp } from "../Mail/MailMustangApp";
import { webAppsMustangApp } from "../WebApps/WebAppsMustangApp";
import { contactsMustangApp } from "../Contacts/ContactsMustangApp";
import { calendarMustangApp } from "../Calendar/CalendarMustangApp";
import { chatMustangApp } from "../Chat/ChatMustangApp";
import { filesMustangApp } from "../Files/FilesMustangApp";
import { myHarddrive } from "../../logic/Files/Harddrive/HarddriveAccount";
import { appGlobal } from "../../logic/app";
import GlobalAppearance from "./Global/Appearance.svelte";
import GlobalWorkspaces from "./Global/Workspaces.svelte";
import GlobalSystemIntegration from "./Global/SystemIntegration.svelte";
import MailAppearance from "./Mail/Appearance.svelte";
import MailNotifications from "./Mail/Notifications.svelte";
import MailRead from "./Mail/Read.svelte";
import MailSend from "./Mail/Send.svelte";
import MailTags from "./Mail/Tags.svelte";
import MailRules from "./Mail/Rules.svelte";
import AccountGeneral from "./AccountGeneral.svelte";
import AccountURLServer from "./AccountURLServer.svelte";
import AccountMailServer from "./Mail/Account/Server.svelte";
import AccountFolders from "./Mail/Account/Folders.svelte";
import AccountIdentity from "./Mail/Account/Identity.svelte";
import AccountXMPPServer from "./Chat/AccountXMPPServer.svelte";
import ChatNotifications from "./Chat/Notifications.svelte";
import About from "./About/About.svelte";
import License from "./License/Page/License.svelte";
import OpenSource from "./About/OpenSource.svelte";
// #if [!WEBMAIL]
import SetupMail from "../Setup/Mail/SetupMail.svelte";
import SetupChat from "../Setup/Chat/SetupChat.svelte";
import SetupCalendar from "../Setup/Calendar/SetupCalendar.svelte";
import SetupContacts from "../Setup/Contacts/SetupContacts.svelte";
import SetupFiles from "../Setup/Files/SetupFiles.svelte";
// #endif
import { Account } from "../../logic/Abstract/Account";
import { MailAccount } from "../../logic/Mail/MailAccount";
import { XMPPAccount } from "../../logic/Chat/XMPP/XMPPAccount";
// #if [!WEBMAIL]
import { MatrixAccount } from "../../logic/Chat/Matrix/MatrixAccount";
// #endif
// #if [PROPRIETARY]
import { meetMustangApp } from "../Meet/MeetMustangApp";
import SetupMeetAccount from "../Setup/Meet/SetupMeetAccount.svelte";
import { M3Account } from "../../logic/Meet/M3/M3Account";
import Devices from "./Meet/Devices.svelte";
// #endif
import { ArrayColl } from "svelte-collections";
import { gt } from "../../l10n/l10n";

export const settingsCategories = new ArrayColl<SettingsCategory>();
export const accountSettings = new ArrayColl<AccSetting>();

accountSettings.add(new AccSetting(Account, "acc-general", gt`General`, AccountGeneral, true));

const globalSettings = new SettingsCategory("global", gt`General`, null, true);
globalSettings.subCategories.addAll([
  new SettingsCategory("global-appearance", gt`Appearance`, GlobalAppearance),
  new SettingsCategory("global-workspaces", gt`Workspaces`, GlobalWorkspaces),
  new SettingsCategory("global-system-integration", gt`System integration`, GlobalSystemIntegration)
]);
settingsCategories.add(globalSettings);

const mailSettings = new SettingsCategory("mail", gt`Mail`, null, true);
mailSettings.subCategories.addAll([
  new SettingsCategory("mail-appearance", gt`Appearance`, MailAppearance),
  new SettingsCategory("mail-notifications", gt`Notifications`, MailNotifications),
  new SettingsCategory("mail-read", gt`Read *=> in the sense of to read emails`, MailRead),
  new SettingsCategory("mail-send", gt`Send *=> send emails`, MailSend),
  new SettingsCategory("mail-tags", gt`Tags`, MailTags),
]);
mailSettings.accounts = appGlobal.emailAccounts;
// #if [!WEBMAIL]
mailSettings.newAccountUI = SetupMail;
// #endif
mailSettings.forApp = mailMustangApp;
settingsCategories.add(mailSettings);

accountSettings.add(new AccSetting(MailAccount, "mail-server", gt`Server`, AccountMailServer));
accountSettings.add(new AccSetting(MailAccount, "mail-folders", gt`Folders`, AccountFolders));
accountSettings.add(new AccSetting(MailAccount, "mail-identity", gt`Identity`, AccountIdentity));
accountSettings.add(new AccSetting(MailAccount, "mail-identity", gt`Rules *=> Criteria after which emails should be sorted`, MailRules));

const chatSettings = new SettingsCategory("chat", gt`Chat`, null, true);
chatSettings.subCategories.addAll([
  new SettingsCategory("chat-appearance", gt`Appearance`),
  new SettingsCategory("chat-notifications", gt`Notifications`, ChatNotifications),
]);
chatSettings.accounts = appGlobal.chatAccounts;
// #if [!WEBMAIL]
chatSettings.newAccountUI = SetupChat;
// #endif
chatSettings.forApp = chatMustangApp;
settingsCategories.add(chatSettings);

accountSettings.add(new AccSetting(XMPPAccount, "xmpp-server", gt`Server`, AccountXMPPServer));
// #if [!WEBMAIL]
accountSettings.add(new AccSetting(MatrixAccount, "matrix-server", gt`Server`, AccountURLServer));
// #endif
accountSettings.add(new AccSetting(ChatAccount, "chat-send", gt`Send`, null));
accountSettings.add(new AccSetting(ChatAccount, "chat-identity", gt`Identity`, null));

const calendarSettings = new SettingsCategory("calendar", gt`Calendar`, null, true);
calendarSettings.subCategories.addAll([
]);
calendarSettings.accounts = appGlobal.calendarAccounts;
// #if [!WEBMAIL]
calendarSettings.newAccountUI = SetupCalendar;
// #endif
calendarSettings.forApp = calendarMustangApp;
settingsCategories.add(calendarSettings);

const contactsSettings = new SettingsCategory("contacts", gt`Contacts`, null, true);
contactsSettings.subCategories.addAll([
]);
contactsSettings.accounts = appGlobal.addressbookAccounts;
// #if [!WEBMAIL]
contactsSettings.newAccountUI = SetupContacts;
// #endif
contactsSettings.forApp = contactsMustangApp;
settingsCategories.add(contactsSettings);

// #if [PROPRIETARY]
const meetSettings = new SettingsCategory("meet", gt`Meet`, null, true);
meetSettings.subCategories.addAll([
  // new SettingsCategory("meet-appearance", gt`Appearance`),
  new SettingsCategory("meet-devices", gt`Devices`, Devices),
]);
meetSettings.accounts = appGlobal.meetAccounts;
// #endif
// #if [!WEBMAIL && PROPRIETARY]
meetSettings.newAccountUI = SetupMeetAccount;
// #endif
// #if [PROPRIETARY]
meetSettings.forApp = meetMustangApp;
settingsCategories.add(meetSettings);
// #endif

accountSettings.add(new AccSetting(M3Account, "m3-server", gt`Server`, AccountURLServer, true));

const filesSettings = new SettingsCategory("files", gt`Files`, null, true);
filesSettings.subCategories.addAll([
]);
filesSettings.accounts = appGlobal.fileSharingAccounts.filterObservable(acc => acc != myHarddrive);
// #if [!WEBMAIL]
filesSettings.newAccountUI = SetupFiles;
// #endif
filesSettings.forApp = filesMustangApp;
settingsCategories.add(filesSettings);

const appSettings = new SettingsCategory("app", gt`App integration`, null, true);
appSettings.subCategories.addAll([
]);
appSettings.forApp = webAppsMustangApp;
// settingsCategories.add(appSettings);

const about = new SettingsCategory("about", gt`About`, About, true);
about.subCategories.addAll([
  // #if [PROPRIETARY]
  new SettingsCategory("license", gt`Billing`, License),
  // #endif
  new SettingsCategory("opensource", gt`Open-Source`, OpenSource),
]);
settingsCategories.add(about);
