import type { MailAccount } from '../MailAccount';
import { SQLMailAccount } from '../SQL/SQLMailAccount';
import { SQLFolder } from '../SQL/SQLFolder';
import { Collection } from 'svelte-collections';

export async function readMailAccounts(): Promise<Collection<MailAccount>> {
  let mailAccounts = await SQLMailAccount.readAll();
  for (let mailAccount of mailAccounts) {
    SQLFolder.readAllHierarchy(mailAccount);
  }
  return mailAccounts;
}
