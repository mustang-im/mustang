import { MeetAccount } from '../MeetAccount';
import { M3Account } from '../M3Account';
// #if [WEBMAIL]
// #else
import { SQLMeetStorage } from '../SQL/SQLMeetStorage';
// #endif
import { NotReached } from '../../util/util';
import type { Collection } from 'svelte-collections';

export function newMeetAccountForProtocol(protocol: string): MeetAccount {
  let meet = _newMeetAccountForProtocol(protocol);
  meet.storage = new SQLMeetStorage();
  return meet;
}

function _newMeetAccountForProtocol(protocol: string): MeetAccount {
  if (protocol == "meet") {
    return new MeetAccount();
  } else if (protocol == "m3") {
    return new M3Account();
  }
  throw new NotReached(`Unknown meet account type ${protocol}`);
}

// #if [WEBMAIL]
// #else
export async function readMeetAccounts(): Promise<Collection<MeetAccount>> {
  return await SQLMeetStorage.readMeetAccounts();
}
// #endif
