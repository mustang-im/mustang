import { MailAccount } from './MailAccount';
import { IMAPAccount } from './IMAP/IMAPAccount';
import { POP3Account } from './POP3/POP3Account';
import { SMTPAccount } from './SMTP/SMTPAccount';
import { ContactEntry } from '../Abstract/Person';
import { appGlobal } from '../app';
import { NotReached } from '../util/util';
import { sanitize } from '../../../lib/util/sanitizeDatatypes';
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
        accounts.add(await readIMAPAccount(prefBranch, id));
      } else if (protocol == "pop3") {
        accounts.add(await readPOP3Account(prefBranch, id));
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
  await readStandardAccountFromLocalStorage(account, prefBranch);
  return account;
}

async function readPOP3Account(prefBranch: string, id: string): Promise<POP3Account> {
  let account = new POP3Account();
  await readStandardAccountFromLocalStorage(account, prefBranch);
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
}

export function saveNewAccountToLocalStorage(account: MailAccount): void {
  let accountID = nextFreeAccountID();
  let prefBranch = "mail." + accountID;
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

function nextFreeAccountID(): string {
  for (let i = 1; true; i++) {
    let accountID = `account${i}.`;
    let prefBranch = `mail.account${i}.`;
    let protocol = localStorage.getItem(prefBranch + "protocol");
    if (!protocol) {
      return accountID;
    }
  }
}

export function newAccountForProtocol(protocol: string): MailAccount {
  if (protocol == "imap") {
    return new IMAPAccount();
  }
  if (protocol == "pop3") {
    return new POP3Account();
  }
  if (protocol == "smtp") {
    return new SMTPAccount();
  }
  if (protocol == "mail") {
    return new MailAccount();
  }
  throw new NotReached(`Unknown account type ${protocol}`);
}

function readMe(account: MailAccount) {
  if (!appGlobal.me.name && account.userRealname) {
    appGlobal.me.name = account.userRealname;
  }
  appGlobal.me.emailAddresses.add(new ContactEntry(account.emailAddress, "account"));
}
