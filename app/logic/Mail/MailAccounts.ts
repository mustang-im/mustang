import { MailAccount } from './MailAccount';
import { IMAPAccount } from './IMAP/IMAPAccount';
import { POP3Account } from './POP3/POP3Account';
import { sanitize } from '../../../lib/util/sanitizeDatatypes';
import { NotReached } from '../util/util';
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
    let prefBranch = `mail.account${i}.`;
    try {
      let protocol = localStorage.getItem(prefBranch + "protocol");
      if (!protocol) {
        break;
      } else if (protocol == "imap") {
        accounts.add(readIMAPAccount(prefBranch));
      } else if (protocol == "pop3") {
        accounts.add(readPOP3Account(prefBranch));
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
  return accounts;
}

function readIMAPAccount(prefBranch: string): IMAPAccount {
  let account = new IMAPAccount();
  readStandardAccount(account, prefBranch);
  return account;
}

function readPOP3Account(prefBranch: string): POP3Account {
  let account = new POP3Account();
  readStandardAccount(account, prefBranch);
  return account;
}

function readStandardAccount(account: MailAccount, prefBranch: string): void {
  account.hostname = sanitize.hostname(localStorage.getItem(prefBranch + "hostname"));
  account.port = sanitize.portTCP(localStorage.getItem(prefBranch + "port"));
  account.emailAddress = sanitize.nonemptystring(localStorage.getItem(prefBranch + "emailAddress"));
  account.username = sanitize.nonemptystring(localStorage.getItem(prefBranch + "username"));
  account.password = sanitize.string(localStorage.getItem(prefBranch + "password"));
  account.tls = sanitize.translate(localStorage.getItem(prefBranch + "tls"), {
    plain: 1,
    TLS: 2,
    STARTTLS: 3,
  }, 2);
  account.name = account.emailAddress;
}

export function newAccountForProtocol(protocol: string): MailAccount {
  if (protocol == "imap") {
    return new IMAPAccount();
  }
  if (protocol == "pop3") {
    return new POP3Account();
  }
  if (protocol == "mail") {
    return new MailAccount();
  }
  throw new NotReached(`Unknown account type ${protocol}`);
}
