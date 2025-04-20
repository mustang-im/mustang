import { MailAccount, MailAccountStorage, TLSSocketType } from '../MailAccount';
import { IMAPAccount } from '../IMAP/IMAPAccount';
import { POP3Account } from '../POP3/POP3Account';
import { SMTPAccount } from '../SMTP/SMTPAccount';
import { EWSAccount } from '../EWS/EWSAccount';
import { ContactEntry } from '../../Abstract/Person';
import type { EMail } from '../EMail';
import type { Folder } from '../Folder';
import { appGlobal } from '../../app';
import { sanitize } from '../../../../lib/util/sanitizeDatatypes';
import { assert, NotImplemented } from '../../util/util';
import { ArrayColl } from 'svelte-collections';

/**
 * Reads settings for mail accounts,
 * and creates corrsponding `MailAccount` objects.
 * Returns them, and adds them to `appGlobal.mailAccounts`.
 *
 * You still need to call `await account.login()` on each of them.
 */
export async function readMailAccounts(): Promise<ArrayColl<MailAccount>> {
  let accounts = new ArrayColl<MailAccount>();
  for (let i = 1; true; i++) {
    let id = `account${i}`;
    let prefBranch = `mail.account${i}.`;
    try {
      let protocol = sanitize.enum(localStorage.getItem(prefBranch + "protocol"), ["imap", "jmap", "pop3", "smtp", "ews", "activesync", "owa"]);
      if (!protocol) {
        break;
      } else if (protocol == "imap") {
        accounts.add(await readIMAPAccount(prefBranch, id) as any as MailAccount);
      } else if (protocol == "pop3") {
        accounts.add(await readPOP3Account(prefBranch, id) as any as MailAccount);
      } else if (protocol == "ews") {
        accounts.add(await readEWSAccount(prefBranch, id) as any as MailAccount);
      } else {
        console.error(`Unsupported mail protocol ${protocol} in localStorage ${prefBranch}protocol`);
      }
    } catch (ex) {
      console.log("Could not load account", prefBranch);
      console.error(ex);
    }
  }
  if (accounts.isEmpty) {
    console.log("No mail accounts configured. Please set up mail.account1.*");
  }
  for (let account of accounts) {
    readMe(account);
  }
  return accounts;
}

async function readIMAPAccount(prefBranch: string, id: string): Promise<IMAPAccount> {
  let account = new IMAPAccount();
  account.id = id;
  await readStandardAccountFromLocalStorage(account as any as MailAccount, prefBranch);
  account.outgoing = await readSMTPAccount(prefBranch, id) as any as MailAccount;
  return account;
}

async function readPOP3Account(prefBranch: string, id: string): Promise<POP3Account> {
  let account = new POP3Account();
  account.id = id;
  await readStandardAccountFromLocalStorage(account as any as MailAccount, prefBranch);
  account.outgoing = await readSMTPAccount(prefBranch, id) as any as MailAccount;
  return account;
}

async function readStandardAccountFromLocalStorage(account: MailAccount, prefBranch: string): Promise<void> {
  account.hostname = sanitize.hostname(localStorage.getItem(prefBranch + "hostname"));
  account.port = sanitize.portTCP(localStorage.getItem(prefBranch + "port"));
  account.emailAddress = sanitize.nonemptystring(localStorage.getItem(prefBranch + "emailAddress"));
  account.username = sanitize.nonemptystring(localStorage.getItem(prefBranch + "username"));
  // unused code - account.password = sanitize.string(localStorage.getItem(prefBranch + "password"));
  account.realname = sanitize.nonemptystring(localStorage.getItem(prefBranch + "realname") ??
    appGlobal.me.name ?? sanitize.label(localStorage.getItem("me.realname")));
  account.tls = sanitize.translate(localStorage.getItem(prefBranch + "tls"), {
    plain: TLSSocketType.Plain,
    tls: TLSSocketType.TLS,
    starttls: TLSSocketType.STARTTLS,
  }, TLSSocketType.TLS);
  account.name = account.emailAddress;
  account.storage = new MailAccountLocalStorage();
}

async function readSMTPAccount(prefBranchBase: string, idBase: string): Promise<SMTPAccount> {
  let prefBranchSMTP = prefBranchBase + "smtp.";
  let id = idBase + "-smtp";
  let account = new SMTPAccount();
  account.id = id;
  account.hostname = sanitize.hostname(localStorage.getItem(prefBranchSMTP + "hostname"));
  account.port = sanitize.portTCP(localStorage.getItem(prefBranchSMTP + "port"));
  account.username = sanitize.nonemptystring(localStorage.getItem(prefBranchSMTP + "username"));
  // unused code - account.password = sanitize.string(localStorage.getItem(prefBranchSMTP + "password"));
  account.tls = sanitize.translate(localStorage.getItem(prefBranchSMTP + "tls"), {
    plain: TLSSocketType.Plain,
    tls: TLSSocketType.TLS,
    starttls: TLSSocketType.STARTTLS,
  }, TLSSocketType.TLS);
  account.emailAddress = sanitize.nonemptystring(localStorage.getItem(prefBranchBase + "emailAddress"));
  account.realname = sanitize.nonemptystring(localStorage.getItem(prefBranchBase + "realname") ??
    appGlobal.me.name ?? sanitize.label(localStorage.getItem("me.realname")));
  account.name = account.emailAddress;
  account.storage = new MailAccountLocalStorage();
  return account;
}

async function readEWSAccount(prefBranch: string, id: string): Promise<EWSAccount> {
  let account = new EWSAccount();
  account.id = id;
  account.prefBranch = prefBranch;
  account.hostname = sanitize.hostname(localStorage.getItem(prefBranch + "hostname"));
  account.emailAddress = sanitize.nonemptystring(localStorage.getItem(prefBranch + "emailAddress"));
  account.username = sanitize.nonemptystring(localStorage.getItem(prefBranch + "username") || account.emailAddress);
  // unused code - account.password = sanitize.string(localStorage.getItem(prefBranch + "password"), null); // not required to exist
  account.realname = sanitize.nonemptystring(localStorage.getItem(prefBranch + "realname") ??
    appGlobal.me.name ?? sanitize.label(localStorage.getItem("me.realname")));
  account.name = account.emailAddress;
  account.storage = new MailAccountLocalStorage();
  return account;
}

export function saveAccountToLocalStorage(account: MailAccount): void {
  if (!account.id) {
    account.id = nextFreeAccountID();
  }
  let prefBranch = "mail." + account.id + ".";
  localStorage.setItem(prefBranch + "protocol", sanitize.alphanumdash(account.protocol));
  localStorage.setItem(prefBranch + "hostname", sanitize.hostname(account.hostname));
  localStorage.setItem(prefBranch + "port", sanitize.portTCP(account.port) + "");
  localStorage.setItem(prefBranch + "emailAddress", sanitize.emailAddress(account.emailAddress));
  localStorage.setItem(prefBranch + "username", sanitize.nonemptystring(account.username));
  // unused code - localStorage.setItem(prefBranch + "password", sanitize.string(account.password));
  localStorage.setItem(prefBranch + "realname", sanitize.nonemptystring(
    account.realname ?? appGlobal.me.name ?? sanitize.label(localStorage.getItem("me.realname"))));
  localStorage.setItem(prefBranch + "tls", sanitize.alphanumdash(account.tls.toString().toLowerCase()));
  account.name = sanitize.emailAddress(account.emailAddress);
}

export function deleteAccountFromLocalStorage(account: MailAccount): void {
  assert(account.id, "Need account ID to delete it");
  let prefBranch = "mail." + account.id + ".";
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    if (key?.startsWith(prefBranch)) {
      localStorage.removeItem(key);
    }
  }
}

function nextFreeAccountID(): string {
  for (let i = 1; true; i++) {
    let accountID = `account${i}`;
    let prefBranch = `mail.account${i}.`;
    let protocol = sanitize.string(localStorage.getItem(prefBranch + "protocol"), null);
    if (!protocol) {
      return accountID;
    }
  }
}

function readMe(account: MailAccount) {
  if (!appGlobal.me.name && account.realname) {
    appGlobal.me.name = account.realname;
  }
  if (!appGlobal.me.emailAddresses.find(c => c.value == account.emailAddress)) {
    appGlobal.me.emailAddresses.add(new ContactEntry(account.emailAddress, "account"));
  }
}

export class MailAccountLocalStorage implements MailAccountStorage {
  async deleteAccount(account: MailAccount): Promise<void> {
    deleteAccountFromLocalStorage(account);
  }
  async saveAccount(account: MailAccount): Promise<void> {
    saveAccountToLocalStorage(account);
  }

  async readFolderHierarchy(account: MailAccount): Promise<void> {
    throw new NotImplemented();
  }
  async saveFolder(folder: Folder): Promise<void> {
    throw new NotImplemented();
  }
  async saveFolderProperties(folder: Folder): Promise<void> {
    throw new NotImplemented();
  }
  async deleteFolder(folder: Folder): Promise<void> {
    throw new NotImplemented();
  }
  async readMessage(email: EMail): Promise<void> {
    throw new NotImplemented();
  }
  async readMessageWritableProps(email: EMail): Promise<void> {
    throw new NotImplemented();
  }
  async readMessageBody(email: EMail): Promise<void> {
    throw new NotImplemented();
  }
  async saveMessage(email: EMail): Promise<void> {
    throw new NotImplemented();
  }
  async saveMessageWritableProps(email: EMail): Promise<void> {
    throw new NotImplemented();
  }
  async saveMessageTags(email: EMail): Promise<void> {
    throw new NotImplemented();
  }
  async deleteMessage(email: EMail): Promise<void> {
    throw new NotImplemented();
  }
  async readAllMessages(folder: Folder, limit?: number | undefined, startWith?: number | undefined): Promise<void> {
    throw new NotImplemented();
  }
}
