import { MeetAccount } from '../MeetAccount';
import { LiveKitAccount } from '../LiveKit/LiveKitAccount';
import { M3Account } from '../M3/M3Account';
import { SIPAccount } from '../SIP/SIPAccount';
// #if [!WEBMAIL]
import { SQLMeetStorage } from '../SQL/SQLMeetStorage';
// #else
import { DummyMeetStorage } from '../SQL/DummyMeetStorage';
// #endif
import { NotReached } from '../../util/util';
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
  } else if (protocol == "livekit") {
    return new LiveKitAccount();
  } else if (protocol == "m3") {
    return new M3Account();
  } else if (protocol == "sip") {
    return new SIPAccount();
  }
  throw new NotReached(`Unknown meet account type ${protocol}`);
}

// #if [!WEBMAIL]
export async function readMeetAccounts(): Promise<Collection<MeetAccount>> {
  return await SQLMeetStorage.readMeetAccounts();
}
// #endif
