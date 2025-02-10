import type { MeetAccount, MeetAccountStorage } from "../MeetAccount";
import { ArrayColl, type Collection } from "svelte-collections";

export class DummyMeetStorage implements MeetAccountStorage {
  async deleteAccount(account: MeetAccount): Promise<void> {
  }
  async saveAccount(account: MeetAccount): Promise<void> {
  }
  static async readMeetAccounts(): Promise<Collection<MeetAccount>> {
    return new ArrayColl<MeetAccount>();
  }
}
