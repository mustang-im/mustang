import type { MailAccount, MailAccountStorage, OutgoingMailAccount } from '../MailAccount';
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
      let protocol = localStorage.getItem(prefBranch + "protocol");
      if (!protocol) {
        break;
      } else if (protocol == "imap") {
        accounts.add(await readIMAPAccount(prefBranch, id) as any as MailAccount);
      } else if (protocol == "pop3") {
        accounts.add(await readPOP3Account(prefBranch, id) as any as MailAccount);
      } else if (protocol == "ews") {
        accounts.add(await readEWSAccount(prefBranch, id) as any as MailAccount);
      } else {
        console.error(`Unknown mail protocol ${protocol} in localStorage ${prefBranch}protocol`);
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
  account.outgoing = await readSMTPAccount(prefBranch, id) as any as MailAccount & OutgoingMailAccount;
  return account;
}

async function readPOP3Account(prefBranch: string, id: string): Promise<POP3Account> {
  let account = new POP3Account();
  account.id = id;
  await readStandardAccountFromLocalStorage(account as any as MailAccount, prefBranch);
  account.outgoing = await readSMTPAccount(prefBranch, id) as any as MailAccount & OutgoingMailAccount;
  return account;
}

async function readStandardAccountFromLocalStorage(account: MailAccount, prefBranch: string): Promise<void> {
  account.hostname = sanitize.hostname(localStorage.getItem(prefBranch + "hostname"));
  account.port = sanitize.portTCP(localStorage.getItem(prefBranch + "port"));
  account.emailAddress = sanitize.nonemptystring(localStorage.getItem(prefBranch + "emailAddress"));
  account.username = sanitize.nonemptystring(localStorage.getItem(prefBranch + "username"));
  account.password = sanitize.string(localStorage.getItem(prefBranch + "password"));
  account.userRealname = sanitize.nonemptystring(localStorage.getItem(prefBranch + "userRealname") ??
    appGlobal.me.name ?? localStorage.getItem("me.realname"));
  account.tls = sanitize.translate(localStorage.getItem(prefBranch + "tls"), {
    plain: 1,
    tls: 2,
    starttls: 3,
  }, 2);
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
  account.password = sanitize.string(localStorage.getItem(prefBranchSMTP + "password"));
  account.tls = sanitize.translate(localStorage.getItem(prefBranchSMTP + "tls"), {
    plain: 1,
    tls: 2,
    starttls: 3,
  }, 2);
  account.emailAddress = sanitize.nonemptystring(localStorage.getItem(prefBranchBase + "emailAddress"));
  account.userRealname = sanitize.nonemptystring(localStorage.getItem(prefBranchBase + "userRealname") ??
    appGlobal.me.name ?? localStorage.getItem("me.realname"));
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
  account.password = localStorage.getItem(prefBranch + "password"); // not required to exist
  account.userRealname = sanitize.nonemptystring(localStorage.getItem(prefBranch + "userRealname") ??
    appGlobal.me.name ?? localStorage.getItem("me.realname"));
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
  localStorage.setItem(prefBranch + "password", sanitize.string(account.password));
  localStorage.setItem(prefBranch + "userRealname", sanitize.nonemptystring(
    account.userRealname ?? appGlobal.me.name ?? localStorage.getItem("me.realname")));
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
    let protocol = localStorage.getItem(prefBranch + "protocol");
    if (!protocol) {
      return accountID;
    }
  }
}

function readMe(account: MailAccount) {
  if (!appGlobal.me.name && account.userRealname) {
    appGlobal.me.name = account.userRealname;
  }
  appGlobal.me.emailAddresses.add(new ContactEntry(account.emailAddress, "account"));
}

export class MailAccountLocalStorage implements MailAccountStorage {
  async deleteAccount(account: MailAccount): Promise<void> {
    deleteAccountFromLocalStorage(account);
  }
  async saveAccount(account: MailAccount): Promise<void> {
    saveAccountToLocalStorage(account);
  }
  async saveMessage(email: EMail): Promise<void> {
    throw new NotImplemented();
  }
  async saveFolder(folder: Folder): Promise<void> {
    throw new NotImplemented();
  }
}
