import { MailAccount } from "../MailAccount";
import { ContactEntry } from "../../Abstract/Person";
import { Folder, SpecialFolder } from "../../Mail/Folder";
import { MailIdentity } from "../MailIdentity";
import { type PersonUID, nameFromEmailAddress } from "../../Abstract/PersonUID";
import type { Account } from "../../Abstract/Account";
import { Calendar } from "../../Calendar/Calendar";
import { Addressbook } from "../../Contacts/Addressbook";
import { FileSharingAccount } from "../../Files/FileSharingAccount";
import { ChatAccount } from "../../Chat/ChatAccount";
import { MeetAccount } from "../../Meet/MeetAccount";
import { appGlobal } from "../../app";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotReached, assert } from "../../util/util";
import { SetColl } from "svelte-collections";

export async function saveAndInitConfig(config: MailAccount, emailAddress: string, password: string): Promise<void> {
  await saveConfig(config, emailAddress, password);

  if (config.setup) {
    let s = config.setup;
    let services = [s.calendar, s.addressbook, s.fileShare, s.chat, s.meet];
    for (let service of services) {
      if (service) {
        await saveChildService(service, config);
      }
    }
  }

  getFirstMessages(config)
    .catch(backgroundError);
}

export async function saveConfig(config: MailAccount, emailAddress: string, password: string): Promise<void> {
  fillConfig(config, emailAddress, password);

  let identity = new MailIdentity(config);
  identity.realname = config.realname;
  identity.emailAddress = config.emailAddress;
  config.identities.add(identity);

  if (!appGlobal.me.emailAddresses.find(c => c.value == config.emailAddress)) {
    appGlobal.me.emailAddresses.add(new ContactEntry(config.emailAddress, "account"));
  }

  appGlobal.emailAccounts.add(config);
  console.log("Saving new mail account", config);
  // saveAccountToLocalStorage(config);
  await config.saveAll();
}

export async function saveChildService(config: Account, parent: Account): Promise<void> {
  config.realname = parent.realname;
  config.username = parent.username;
  config.password = parent.password;
  config.name = parent.name;
  config.color = parent.color;
  config.icon = parent.icon;
  config.mainAccount = parent;
  addAccountToGlobal(config);
  await config.save();
}

/**
 * Replaces any variables (e.g. %EMAILADDRESS%) in the config with the
 * concrete user values. Also adds real name etc.
 * Changes the config in-place.
 */
export function fillConfig(config: MailAccount, emailAddress: string, password: string) {
  if (config.source == "manual") {
    return;
  }
  assert(emailAddress, `${config.name}: Need email address`);
  config.realname = appGlobal.me.name ?? nameFromEmailAddress(emailAddress); // may be overwritten in setRealname()
  config.emailAddress = emailAddress;
  config.password = password;
  config.username = config.username ? replaceVar(config.username, emailAddress) : emailAddress;
  config.hostname = replaceVar(config.hostname, emailAddress);
  config.name = config.name ? replaceVar(config.name, emailAddress) : emailAddress;

  // Rename existing account
  let existingAccount = appGlobal.emailAccounts.find(acc => acc.name == config.name);
  if (existingAccount && !existingAccount.name.includes(emailAddress)) {
    config.name += " " + emailAddress;
    existingAccount.name += " " + existingAccount.emailAddress;
    existingAccount.save().catch(backgroundError);
  }

  if (config.outgoing) {
    if (config.outgoing.name == config.name) {
      config.outgoing.name += " "; // Hack for SMTP and uniqueness
    }
    fillConfig(config.outgoing, emailAddress, password);
  }
}

function replaceVar(str: string, emailAddress: string): string {
  if (!str) {
    return str;
  }
  let emailParts = emailAddress.split("@");
  assert(emailParts.length == 2, `Email address ${emailAddress} is malformed`);
  return (str
    .replace("%EMAILADDRESS%", emailAddress)
    .replace("%EMAILLOCALPART%", emailParts[0])
    .replace("%EMAILDOMAIN%", emailParts[1])
  );
}

/**
 * 1. Gets Inbox and Sent messages
 * 2. Sets the realname of the user based on the From in messages in Sent
 * 3. Pre-populates the Collected Addresses. */
export async function getFirstMessages(config: MailAccount) {
  await config.login(true);
  let sent = config.getSpecialFolder(SpecialFolder.Sent);
  let inbox = config.getSpecialFolder(SpecialFolder.Inbox);
  if (sent) {
    await sent.listMessages();
    await setRealname(sent, config);
    await populateCollectedAddresses(sent, config);
  }
  if (sent != inbox) {
    await inbox.listMessages();
  }
}

async function setRealname(sentFolder: Folder, config: MailAccount) {
  if (appGlobal.me.name) {
    return;
  }
  let emailFromMe = sentFolder.messages.contents.reverse().find(msg =>
    msg.from?.emailAddress == config.emailAddress &&
    !!sanitize.label(msg.from.name, null));
  if (!emailFromMe) {
    return;
  }
  appGlobal.me.name = config.realname = emailFromMe.from.name;
  await config.save();
}

async function populateCollectedAddresses(sentFolder: Folder, config: MailAccount) {
  /** We cannot trust that `sentFolder` is really the Sent folder, so
   * double-check using the From address of each message. */
  let sentMsgs = sentFolder.messages.contents.filter(msg => msg.from?.emailAddress == config.emailAddress);
  let recipientLists = sentMsgs.flatMap(msg => msg.to);
  let recipients = new SetColl<PersonUID>();
  for (let list of recipientLists) {
    for (let person of list) {
      if (person.emailAddress && person.name &&
        !recipients.find(prev => prev.emailAddress == person.emailAddress)) {
        recipients.add(person);
      }
    }
  }
  let collected = appGlobal.collectedAddressbook.persons;
  await appGlobal.collectedAddressbook.save();
  for (let recipient of recipients) {
    let person = appGlobal.collectedAddressbook.newPerson();
    person.name = recipient.name;
    let contact = new ContactEntry(recipient.emailAddress, "collected");
    contact.protocol = "email";
    person.emailAddresses.add(contact);
    collected.add(person);
    await person.saveLocally();
  }
}

function addAccountToGlobal(account: Account) {
  if (account instanceof MailAccount) {
    appGlobal.emailAccounts.add(account);
  } else if (account instanceof Calendar) {
    appGlobal.calendars.add(account);
  } else if (account instanceof Addressbook) {
    appGlobal.addressbooks.add(account);
  } else if (account instanceof FileSharingAccount) {
    appGlobal.fileSharingAccounts.add(account);
  } else if (account instanceof ChatAccount) {
    appGlobal.chatAccounts.add(account);
  } else if (account instanceof MeetAccount) {
    appGlobal.meetAccounts.add(account);
  } else {
    throw new NotReached();
  }
}
