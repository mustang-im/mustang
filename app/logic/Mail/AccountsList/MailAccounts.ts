import { MailAccount } from '../MailAccount';
import { JMAPAccount } from '../JMAP/JMAPAccount';
// #if [WEBMAIL]
// #else
import { IMAPAccount } from '../IMAP/IMAPAccount';
import { POP3Account } from '../POP3/POP3Account';
import { SMTPAccount } from '../SMTP/SMTPAccount';
import { EWSAccount } from '../EWS/EWSAccount';
import { OWAAccount } from '../OWA/OWAAccount';
import { ActiveSyncAccount } from '../ActiveSync/ActiveSyncAccount';
import { SQLMailStorage } from '../SQL/SQLMailStorage';
// #endif
import { setStorage } from '../Store/setStorage';
import { isWebMail } from '../../build';
import { NotReached, assert } from '../../util/util';
import type { Collection } from 'svelte-collections';

export function newAccountForProtocol(protocol: string): MailAccount {
  let acc = _newAccountForProtocol(protocol);
  setStorage(acc);
  return acc;
}

function _newAccountForProtocol(protocol: string): MailAccount {
  // #if [WEBMAIL]
  if (isWebMail) {
    assert(protocol == "jmap", "Need JMAP account for webmail");
    return new JMAPAccount();
  }
  // #else

  if (protocol == "imap") {
    return new IMAPAccount();
  } else if (protocol == "pop3") {
    return new POP3Account();
  } else if (protocol == "jmap") {
    return new JMAPAccount();
  } else if (protocol == "smtp") {
    return new SMTPAccount();
  } else if (protocol == "ews") {
    return new EWSAccount();
  } else if (protocol == "owa") {
    return new OWAAccount();
  } else if (protocol == "activesync") {
    return new ActiveSyncAccount();
  } else if (protocol == "mail") {
    return new MailAccount();
  }
  throw new NotReached(`Unknown account type ${protocol}`);
  // #endif
}

// #if [WEBMAIL]
// #else
export async function readMailAccounts(): Promise<Collection<MailAccount>> {
  return await SQLMailStorage.readMailAccounts();
}
// #endif


const kProtocolLabel = {
  // Displayed to user, but do not translate (technical term)
  "imap": "IMAP",
  "pop3": "POP3",
  "smtp": "SMTP",
  "jmap": "JMAP",
  "ews": "EWS",
  "owa": "OWA",
  "activesync": "ActiveSync",
}

export function listMailProtocols(): string[] {
  return Object.keys(kProtocolLabel).filter(p => p != "smtp");
}

export function labelForMailProtocol(protocol: string): string {
  return kProtocolLabel[protocol];
}
