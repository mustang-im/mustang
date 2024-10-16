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
  let acc: MailAccount;
  if (protocol == "imap") {
    acc = new IMAPAccount();
  } else if (protocol == "pop3") {
    acc = new POP3Account();
  } else if (protocol == "smtp") {
    acc = new SMTPAccount();
  } else if (protocol == "ews") {
    acc = new EWSAccount();
  } else if (protocol == "owa") {
    acc = new OWAAccount();
  } else if (protocol == "activesync") {
    acc = new ActiveSyncAccount();
  } else if (protocol == "mail") {
    acc = new MailAccount();
  } else {
    throw new NotReached(`Unknown account type ${protocol}`);
  }
  acc.storage = new SQLMailStorage();
  setContentStorage(acc);
  return acc;
}
