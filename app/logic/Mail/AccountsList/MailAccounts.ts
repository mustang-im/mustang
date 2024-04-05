import { MailAccount } from '../MailAccount';
import { IMAPAccount } from '../IMAP/IMAPAccount';
import { POP3Account } from '../POP3/POP3Account';
import { SMTPAccount } from '../SMTP/SMTPAccount';
import { EWSAccount } from '../EWS/EWSAccount';
import { OWAAccount } from '../OWA/OWAAccount';
import { ActiveSyncAccount } from '../ActiveSync/ActiveSyncAccount';
import { NotReached } from '../../util/util';

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
  if (protocol == "ews") {
    return new EWSAccount();
  }
  if (protocol == "owa") {
    return new OWAAccount();
  }
  if (protocol == "activesync") {
    return new ActiveSyncAccount();
  }
  if (protocol == "mail") {
    return new MailAccount();
  }
  throw new NotReached(`Unknown account type ${protocol}`);
}
