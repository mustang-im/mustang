import { EMail } from '../EMail';
import { Folder } from '../Folder';
import { SQLAccount } from './SQLAccount';
import { SQLEMail } from './SQLEMail';
import { SQLFolder } from './SQLFolder';
import { fakeChatPerson, fakeMailAccount, fakePersons } from '../../testData';
import { appGlobal } from '../../app';
import { ArrayColl } from 'svelte-collections';
import { expect, test } from 'vitest';

test("Save and read from SQL database", async () => {
  // Fake data
  appGlobal.me = fakeChatPerson();
  appGlobal.persons.addAll(fakePersons(50));
  appGlobal.emailAccounts.add(fakeMailAccount(appGlobal.persons, appGlobal.me, 300));
  let originalAccount = appGlobal.emailAccounts[0];
  let originalFolders = originalAccount.getAllFolders();
  let originalMessages = new ArrayColl<EMail>();

  // Save
  await SQLAccount.save(originalAccount);
  for (let folder of originalFolders) {
    await SQLFolder.save(folder);
    originalMessages.addAll(folder.messages);
    for (let msg of folder.messages) {
      await SQLEMail.save(msg);
    }
  }

  // Clear
  appGlobal.persons.clear();
  appGlobal.emailAccounts.clear();

  // Read
  appGlobal.emailAccounts.addAll(await SQLAccount.readAll());
  async function readMsgsAndSubFolders(folder: Folder) {
    folder.messages.addAll(await SQLEMail.readAll(folder));
    for (let sub of folder.subFolders) {
      await readMsgsAndSubFolders(sub);
    }
  }
  for (let account of appGlobal.emailAccounts) {
    account.rootFolders.addAll(await SQLFolder.readAllHierarchy(account));
    for (let folder of account.rootFolders) {
      await readMsgsAndSubFolders(folder);
    }
  }

  // Check and verify
  expect(appGlobal.emailAccounts.length).toBe(1);
  let readAccount = appGlobal.emailAccounts.first;
  expect(readAccount).toEqual(originalAccount);
  let readFolders = readAccount.getAllFolders();
  expect(readFolders).toEqual(originalFolders);
  let readMessages = new ArrayColl<EMail>();
  for (let folder of readFolders) {
    readMessages.addAll(folder.messages);
  }
  expect(readMessages).toEqual(originalMessages);
});
