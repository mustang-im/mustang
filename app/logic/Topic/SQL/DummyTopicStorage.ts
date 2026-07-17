import type { TopicAccount, TopicAccountStorage } from "../TopicAccount";
import { ArrayColl, type Collection } from "svelte-collections";

export class DummyTopicStorage implements TopicAccountStorage {
  async deleteAccount(account: TopicAccount): Promise<void> {
  }
  async saveAccount(account: TopicAccount): Promise<void> {
  }
  static async readTopicAccounts(): Promise<Collection<TopicAccount>> {
    return new ArrayColl<TopicAccount>();
  }
}
