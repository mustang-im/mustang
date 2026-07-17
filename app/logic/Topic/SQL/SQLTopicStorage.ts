import { SQLTopicAccount } from "./SQLTopicAccount";
import { SQLTopic } from "./SQLTopic";
import type { Topic } from "../Topic";
import type { TopicAccount, TopicAccountStorage } from "../TopicAccount";
import type { Collection } from "svelte-collections";

export class SQLTopicStorage implements TopicAccountStorage {
  async saveAccount(account: TopicAccount): Promise<void> {
    await SQLTopicAccount.save(account);
  }
  async deleteAccount(account: TopicAccount): Promise<void> {
    await SQLTopicAccount.deleteIt(account);
  }
  async saveTopic(topic: Topic): Promise<void> {
    await SQLTopic.save(topic);
  }
  async deleteTopic(topic: Topic): Promise<void> {
    await SQLTopic.deleteIt(topic);
  }

  static async readTopicAccounts(): Promise<Collection<TopicAccount>> {
    let accounts = await SQLTopicAccount.readAll();
    for (let account of accounts) {
      await SQLTopic.readAll(account);
    }
    return accounts;
  }
}
