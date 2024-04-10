import { MeetAccount } from '../MeetAccount';
import { SQLMeetAccount } from '../SQL/SQLMeetAccount';
import { Collection } from 'svelte-collections';

export async function readMeetAccounts(): Promise<Collection<MeetAccount>> {
  return await SQLMeetAccount.readAll();
}
