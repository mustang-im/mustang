import { MeetAccount } from '../MeetAccount';
import { M3Account } from '../M3Account';
import { SQLMeetStorage } from '../SQL/SQLMeetStorage';
import { NotReached } from '../../util/util';

export function newMeetAccountForProtocol(protocol: string): MeetAccount {
  let meet: MeetAccount;
  if (protocol == "meet") {
    meet = new MeetAccount();
  } else if (protocol == "m3") {
    meet = new M3Account();
  } else {
    throw new NotReached(`Unknown meet account type ${protocol}`);
  }
  meet.storage = new SQLMeetStorage();
  return meet;
}
