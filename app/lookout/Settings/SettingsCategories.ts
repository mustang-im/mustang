import { SettingsCategory, AccountSettingsCategory as AccSetting } from "../../frontend/Settings/SettingsCategory";
import { mailMustangApp } from "../../frontend/Mail/MailMustangApp";
import { contactsMustangApp } from "../../frontend/Contacts/ContactsMustangApp";
import { calendarMustangApp } from "../../frontend/Calendar/CalendarMustangApp";
import { chatMustangApp } from "../../frontend/Chat/ChatMustangApp";
import { filesMustangApp } from "../../frontend/Files/FilesMustangApp";
import { myHarddrive } from "../../logic/Files/Harddrive/HarddriveAccount";
import { appGlobal } from "../../logic/app";
import GlobalAppearance from "./Global/Appearance.svelte";
import GlobalLanguage from "./Global/Language.svelte";
import GlobalWorkspaces from "./Global/Workspaces.svelte";
import MailGeneral from "./Mail/General.svelte";
import CalendarGeneral from "./Calendar/General.svelte";
import ContactsGeneral from "./Contacts/General.svelte";
import TrustCenterGeneral from "./TrustCenter/General.svelte";
import AccountGeneral from "./AccountGeneral.svelte";
import AccountURLServer from "../../frontend/Settings/AccountURLServer.svelte";
import AccountSubAccounts from "./AccountSubAccounts.svelte";
import AccountMailServer from "../../frontend/Settings/Mail/Account/Server.svelte";
import AccountFolders from "../../frontend/Settings/Mail/Account/Folders.svelte";
import AccountIdentity from "../../frontend/Settings/Mail/Account/Identity.svelte";
import MailRules from "../../frontend/Settings/Mail/Rules.svelte";
import MailSharing from "../../frontend/Settings/Mail/Sharing.svelte";
import MailConnectedAccounts from "../../frontend/Settings/Mail/ConnectedAccounts.svelte";
import AccountXMPPServer from "../../frontend/Settings/Chat/AccountXMPPServer.svelte";
import ChatGeneral from "./Chat/General.svelte";
import FilesGeneral from "./Files/General.svelte";
import WhatsAppImportBackup from "../../frontend/Settings/Chat/WhatsAppImportBackup.svelte";
import CalendarConnectedAccounts from "./Calendar/ConnectedAccounts.svelte";
import CalendarImportExport from "./Calendar/ImportExport.svelte";
import ContactsImportExport from "./Contacts/ImportExport.svelte";
import { Account } from "../../logic/Abstract/Account";
import { MailAccount } from "../../logic/Mail/MailAccount";
import { XMPPAccount } from "../../logic/Chat/XMPP/XMPPAccount";
// #if [!WEBMAIL]
import { MatrixAccount } from "../../logic/Chat/Matrix/MatrixAccount";
// #endif
import { WhatsAppAccount } from "../../logic/Chat/WhatsApp/WhatsAppAccount";
import { Addressbook } from "../../logic/Contacts/Addressbook";
import { Calendar } from "../../logic/Calendar/Calendar";
import { CardDAVAddressbook } from "../../logic/Contacts/CardDAV/CardDAVAddressbook";
import { CalDAVCalendar } from "../../logic/Calendar/CalDAV/CalDAVCalendar";
import { WebDAVAccount } from "../../logic/Files/WebDAV/WebDAVAccount";
// #if [PROPRIETARY]
import { meetMustangApp } from "../../frontend/Meet/MeetMustangApp";
import { M3Account } from "../../logic/Meet/M3/M3Account";
import Devices from "../../frontend/Settings/Meet/Devices.svelte";
import { SIPAccount } from "../../logic/Meet/SIP/SIPAccount";
import SIP from "../../frontend/Settings/Meet/SIP.svelte";
// #endif
import { gt } from "../../l10n/l10n";
import { ArrayColl } from "svelte-collections";

export const settingsCategories = new ArrayColl<SettingsCategory>();
export const accountSettings = new ArrayColl<AccSetting>();

accountSettings.add(new AccSetting(Account, "acc-general", gt`General *=> Settings page with the general settings`, AccountGeneral, true));
accountSettings.add(new AccSetting(Account, "acc-sub", gt`Sub-Accounts *=> Calendars, address books and other accounts that are part of this account`, AccountSubAccounts, true));

const globalSettings = new SettingsCategory("global", gt`General *=> Settings page with the general settings`, GlobalAppearance, true);
globalSettings.subCategories.addAll([
  new SettingsCategory("language", gt`Language *=> Settings page for the display language and the date format`, GlobalLanguage),
  new SettingsCategory("global-workspaces", gt`Workspaces *=> Settings page for the workspaces: groups of accounts, e.g. Work and Private`, GlobalWorkspaces),
]);
settingsCategories.add(globalSettings);

const mailSettings = new SettingsCategory("mail", gt`Mail *=> Settings page for email`, MailGeneral, true);
mailSettings.accounts = appGlobal.emailAccounts;
// #if [!WEBMAIL]
mailSettings.newAccountURL = "/setup/mail";
// #endif
mailSettings.forApp = mailMustangApp;
settingsCategories.add(mailSettings);

// <copied from="../../frontend/Settings/SettingsCategories.ts">
accountSettings.add(new AccSetting(MailAccount, "mail-connected", gt`Connected accounts`, MailConnectedAccounts, true));
// #if [!WEBMAIL]
accountSettings.add(new AccSetting(MailAccount, "mail-server", gt`Server *=> Settings page for the server and logon settings of the account`, AccountMailServer));
// #endif
accountSettings.add(new AccSetting(MailAccount, "mail-folders", gt`Folders *=> Settings page for the folders of the email account`, AccountFolders));
accountSettings.add(new AccSetting(MailAccount, "mail-identity", gt`Identities *=> Settings page for the sender names and email addresses of the account`, AccountIdentity));
accountSettings.add(new AccSetting(MailAccount, "mail-rules", gt`Rules *=> Criteria after which emails should be sorted`, MailRules));
accountSettings.add(new AccSetting(MailAccount, "mail-sharing", gt`Sharing *=> Accessing mail account of team mates`, MailSharing));
// </copied>

const calendarSettings = new SettingsCategory("calendar", gt`Calendar *=> Settings page for calendars`, CalendarGeneral, true);
calendarSettings.accounts = appGlobal.calendars;
// #if [!WEBMAIL]
calendarSettings.newAccountURL = "/setup/calendar";
// #endif
calendarSettings.forApp = calendarMustangApp;
settingsCategories.add(calendarSettings);

// <copied from="../../frontend/Settings/SettingsCategories.ts">
accountSettings.add(new AccSetting(Calendar, "calendar-connected", gt`Connected accounts`, CalendarConnectedAccounts, true));
accountSettings.add(new AccSetting(Calendar, "calendar-import", gt`Import/Export *=> Settings page to import data from a file or export it to a file`, CalendarImportExport, true));
accountSettings.add(new AccSetting(CalDAVCalendar, "calendar-server", gt`Server *=> Settings page for the server and logon settings of the account`, AccountURLServer));
// </copied>

const contactsSettings = new SettingsCategory("contacts", gt`People *=> or Persons - Short word, less than 10 characters`, ContactsGeneral, true);
contactsSettings.accounts = appGlobal.addressbooks;
// #if [!WEBMAIL]
contactsSettings.newAccountURL = "/setup/contacts";
// #endif
contactsSettings.forApp = contactsMustangApp;
settingsCategories.add(contactsSettings);

// <copied from="../../frontend/Settings/SettingsCategories.ts">
accountSettings.add(new AccSetting(Addressbook, "contacts-import", gt`Import/Export *=> Settings page to import data from a file or export it to a file`, ContactsImportExport, true));
accountSettings.add(new AccSetting(CardDAVAddressbook, "contacts-server", gt`Server *=> Settings page for the server and logon settings of the account`, AccountURLServer));
// </copied>

const filesSettings = new SettingsCategory("files", gt`Files *=> Settings page for file sharing`, FilesGeneral, true);
filesSettings.accounts = appGlobal.fileSharingAccounts.filterObservable(acc => acc != myHarddrive);
filesSettings.newAccountURL = "/setup/files";
filesSettings.forApp = filesMustangApp;
accountSettings.add(new AccSetting(WebDAVAccount, "webdav-server", gt`Server *=> Settings page for the server and logon settings of the account`, AccountURLServer));
settingsCategories.add(filesSettings);

// #if [DEV]
const chatSettings = new SettingsCategory("chat", gt`Chat *=> Settings page for chat`, ChatGeneral, true);
chatSettings.accounts = appGlobal.chatAccounts;
chatSettings.newAccountURL = "/setup/chat";
chatSettings.forApp = chatMustangApp;
settingsCategories.add(chatSettings);

accountSettings.add(new AccSetting(XMPPAccount, "xmpp-server", gt`Server *=> Settings page for the server and logon settings of the account`, AccountXMPPServer));
accountSettings.add(new AccSetting(MatrixAccount, "matrix-server", gt`Server *=> Settings page for the server and logon settings of the account`, AccountURLServer));
accountSettings.add(new AccSetting(WhatsAppAccount, "whatsapp-import", gt`Import backup`, WhatsAppImportBackup, true));
// #endif

// #if [PROPRIETARY]
const meetSettings = new SettingsCategory("meet", gt`Meet *=> Settings page for video conferences`, Devices, true);
meetSettings.accounts = appGlobal.meetAccounts;
// #endif
// #if [!WEBMAIL && PROPRIETARY]
meetSettings.newAccountURL = "/setup/meet";
// #endif
// #if [PROPRIETARY]
meetSettings.forApp = meetMustangApp;
settingsCategories.add(meetSettings);

accountSettings.add(new AccSetting(M3Account, "m3-server", gt`Server *=> Settings page for the server and logon settings of the account`, AccountURLServer, true));
accountSettings.add(new AccSetting(SIPAccount, "sip", gt`Details *=> Settings page with the details of the phone account`, SIP, true));
// #endif

settingsCategories.add(new SettingsCategory("trust-center", gt`Trust Center`, TrustCenterGeneral, true));
