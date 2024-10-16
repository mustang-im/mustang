import { MailAccount } from '../MailAccount';
import { IMAPAccount } from '../IMAP/IMAPAccount';
import { POP3Account } from '../POP3/POP3Account';
import { SMTPAccount } from '../SMTP/SMTPAccount';
import { EWSAccount } from '../EWS/EWSAccount';
import { OWAAccount } from '../OWA/OWAAccount';
import { ActiveSyncAccount } from '../ActiveSync/ActiveSyncAccount';
import { AceMailStorage } from '../AceBase/AceMailStorage';
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
  return await AceMailStorage.readMailAccounts();
}
