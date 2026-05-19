import type { Topic } from "./Topic";
import { Account } from "../Abstract/Account";
import { appGlobal } from "../app";
import { ArrayColl } from "svelte-collections";

export class TopicAccount extends Account {
  readonly protocol: string = "topic-local";
  storage: TopicAccountStorage | null = null;

  readonly topics = new ArrayColl<Topic>();

  async save(): Promise<void> {
    await super.save();
    await this.storage?.saveAccount(this);
  }

  async deleteIt(): Promise<void> {
    await super.deleteIt();
    await this.storage?.deleteAccount(this);
    appGlobal.topicAccounts.remove(this);
  }
}

export interface TopicAccountStorage {
  saveAccount(account: TopicAccount): Promise<void>;
  deleteAccount(account: TopicAccount): Promise<void>;
  saveTopic(topic: Topic): Promise<void>;
  deleteTopic(topic: Topic): Promise<void>;
}
