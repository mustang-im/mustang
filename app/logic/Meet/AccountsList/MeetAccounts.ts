import { MeetAccount } from '../MeetAccount';
import { M3Account } from '../M3/M3Account';
import { LiveKitAccount } from '../LiveKit/LiveKitAccount';
// #if [!WEBMAIL]
import { SQLMeetStorage } from '../SQL/SQLMeetStorage';
// #else
import { DummyMeetStorage } from '../SQL/DummyMeetStorage';
// #endif
import { appGlobal } from '../../app';
import { NotReached, UserError } from '../../util/util';
import { gt } from '../../../l10n/l10n';
import type { Collection } from 'svelte-collections';

export function newMeetAccountForProtocol(protocol: string): MeetAccount {
  let meet = _newMeetAccountForProtocol(protocol);
  // #if [!WEBMAIL]
  meet.storage = new SQLMeetStorage();
  // #else
  meet.storage = new DummyMeetStorage();
  // #endif
  return meet;
}

function _newMeetAccountForProtocol(protocol: string): MeetAccount {
  if (protocol == "meet") {
    return new MeetAccount();
  } else if (protocol == "m3") {
    return new M3Account();
  } else if (protocol == "livekit") {
    return new LiveKitAccount();
  }
  throw new NotReached(`Unknown meet account type ${protocol}`);
}

// #if [!WEBMAIL]
export async function readMeetAccounts(): Promise<Collection<MeetAccount>> {
  return await SQLMeetStorage.readMeetAccounts();
}
// #endif

export function getMeetAccount(): MeetAccount {
  let account = appGlobal.meetAccounts.find(acc => acc.canVideo && acc.canMultipleParticipants);
  if (!account) {
    throw new UserError(gt`Please configure a matching meeting account first`);
  }
  return account;
}
