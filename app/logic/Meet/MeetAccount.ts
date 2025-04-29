import { Account } from "../Abstract/Account";
import type { VideoConfMeeting } from "./VideoConfMeeting";
import { appGlobal } from "../app";
import { ensureLicensed } from "../util/LicenseClient";
import { AbstractFunction } from "../util/util";

export class MeetAccount extends Account {
  readonly protocol: string = "meet";
  storage: MeetAccountStorage | null = null;

  // Capabilities of the implementation
  /** The implementation allows for participants to share a moving picture. */
  canVideo: boolean;
  /** The implementation allows for participants to exchange voice. */
  canAudio: boolean;
  /** The implementation allows for participants to show others their computer screen. */
  canScreenShare: boolean;
  /** true = Multiple people can speak to each other. Like a group meeting.
   * false = Only our user and one other person can join. Like a phone call. */
  canMultipleParticipants: boolean;
  /** The meeting will have a https: URL that allows other
   * parties to join - even with only a web browser. */
  canCreateURL: boolean;

  async login(interactive: boolean) {
    await ensureLicensed();
    await super.login(interactive);
  }

  /** You still need to `.start()` the conference */
  async createMeeting(): Promise<VideoConfMeeting> {
    throw new AbstractFunction();
  }

  async save(): Promise<void> {
    await this.storage?.saveAccount(this);
  }

  async deleteIt(): Promise<void> {
    await super.deleteIt();
    await this.storage?.deleteAccount(this);
    appGlobal.meetAccounts.remove(this);
  }
}

export interface MeetAccountStorage {
  saveAccount(account: MeetAccount): Promise<void>;
  deleteAccount(account: MeetAccount): Promise<void>;
}
