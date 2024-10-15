import type { ChatAccount } from '../ChatAccount';
import { SQLChatAccount } from './SQLChatAccount';
import { SQLChat } from './SQLChat';
import type { Collection } from 'svelte-collections';

export async function readChatAccounts(): Promise<Collection<ChatAccount>> {
  let chatAccounts = await SQLChatAccount.readAll();
  for (let chatAccount of chatAccounts) {
    SQLChat.readAll(chatAccount);
  }
  return chatAccounts;
}
