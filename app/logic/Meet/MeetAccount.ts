import { Account } from "../Abstract/Account";
import { appGlobal } from "../app";

export class MeetAccount extends Account {
  readonly protocol: string = "meet";
  storage: MeetAccountStorage | null = null;

  async save(): Promise<void> {
    await this.storage?.saveAccount(this);
  }

  async deleteIt(): Promise<void> {
    await this.storage?.deleteAccount(this);
    appGlobal.meetAccounts.remove(this);
  }
}

export interface MeetAccountStorage {
  saveAccount(account: MeetAccount): Promise<void>;
  deleteAccount(account: MeetAccount): Promise<void>;
}
