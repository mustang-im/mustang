import { MailAccount } from '../MailAccount';
import { IMAPAccount } from '../IMAP/IMAPAccount';
import { POP3Account } from '../POP3/POP3Account';
import { SMTPAccount } from '../SMTP/SMTPAccount';
import { EWSAccount } from '../EWS/EWSAccount';
import { OWAAccount } from '../OWA/OWAAccount';
import { ActiveSyncAccount } from '../ActiveSync/ActiveSyncAccount';
import { SQLMailStorage } from '../SQL/SQLMailStorage';
import { setContentStorage } from '../Store/setStorage';
import { NotReached } from '../../util/util';

export function newAccountForProtocol(protocol: string): MailAccount {
  let acc = _newAccountForProtocol(protocol);
  acc.storage = new SQLMailStorage();
  setContentStorage(acc);
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
