import { SQLMeetAccount } from "./SQLMeetAccount";
import type { MeetAccount, MeetAccountStorage } from "../MeetAccount";
import type { Collection } from "svelte-collections";

export class SQLMeetStorage implements MeetAccountStorage {
  async deleteAccount(account: MeetAccount): Promise<void> {
    await SQLMeetAccount.deleteIt(account);
  }
  async saveAccount(account: MeetAccount): Promise<void> {
    await SQLMeetAccount.save(account);
  }

  static async readMeetAccounts(): Promise<Collection<MeetAccount>> {
    return await SQLMeetAccount.readAll();
  }
}
