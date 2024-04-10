import { MeetAccount } from '../MeetAccount';
import { M3Account } from '../M3Account';
import { NotReached } from '../../util/util';

export function newMeetAccountForProtocol(protocol: string): MeetAccount {
  if (protocol == "meet") {
    return new MeetAccount();
  } else if (protocol == "m3") {
      return new M3Account();
  }
  throw new NotReached(`Unknown meet account type ${protocol}`);
}
