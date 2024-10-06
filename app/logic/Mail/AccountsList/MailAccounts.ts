import { MailAccount } from '../MailAccount';
import { IMAPAccount } from '../IMAP/IMAPAccount';
import { JMAPAccount } from '../JMAP/JMAPAccount';
import { POP3Account } from '../POP3/POP3Account';
import { SMTPAccount } from '../SMTP/SMTPAccount';
import { EWSAccount } from '../EWS/EWSAccount';
import { OWAAccount } from '../OWA/OWAAccount';
import { ActiveSyncAccount } from '../ActiveSync/ActiveSyncAccount';
import { SQLMailStorage } from '../SQL/SQLMailStorage';
import { setStorage } from '../Store/setStorage';
import { NotReached } from '../../util/util';
import type { Collection } from 'svelte-collections';

export function newAccountForProtocol(protocol: string): MailAccount {
  let acc = _newAccountForProtocol(protocol);
  setStorage(acc);
  return acc;
}

function _newAccountForProtocol(protocol: string): MailAccount {
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
}

export async function readMailAccounts(): Promise<Collection<MailAccount>> {
  return await SQLMailStorage.readMailAccounts();
}


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
  return Object.keys(kProtocolLabel);
}

export function labelForMailProtocol(protocol: string): string {
  return kProtocolLabel[protocol];
}
