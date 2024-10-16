import { SQLMeetAccount } from "./SQLMeetAccount";
import type { MeetAccount, MeetAccountStorage } from "../MeetAccount";

export class SQLMeetStorage implements MeetAccountStorage {
  async deleteAccount(account: MeetAccount): Promise<void> {
    await SQLMeetAccount.deleteIt(account);
  }
  async saveAccount(account: MeetAccount): Promise<void> {
    await SQLMeetAccount.save(account);
  }
}
