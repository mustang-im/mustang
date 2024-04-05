import { ChatAccount } from '../ChatAccount';
import { SQLChatAccount } from '../SQL/SQLChatAccount';
import { SQLChat } from '../SQL/SQLChat';
import { Collection } from 'svelte-collections';

export async function readChatAccountsFromSQL(): Promise<Collection<ChatAccount>> {
  let chatAccounts = await SQLChatAccount.readAll();
  for (let chatAccount of chatAccounts) {
    SQLChat.readAll(chatAccount);
  }
  return chatAccounts;
}
