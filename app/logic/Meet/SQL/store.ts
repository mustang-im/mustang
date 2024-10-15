import type { MeetAccount } from '../MeetAccount';
import { SQLMeetAccount } from './SQLMeetAccount';
import type { Collection } from 'svelte-collections';

export async function readMeetAccounts(): Promise<Collection<MeetAccount>> {
  return await SQLMeetAccount.readAll();
}
