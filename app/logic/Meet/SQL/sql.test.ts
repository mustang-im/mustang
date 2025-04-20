import { makeTestDatabase } from './SQLDatabase';
import { SQLMeetAccount } from './SQLMeetAccount';
import { fakeMeetAccount, fakeChatPerson } from '../../testData';
import { appGlobal } from '../../app';
import JPCWebSocket from '../../../../lib/jpc-ws/protocol';
import { expect, test } from 'vitest';

test("Save and read meet accounts from SQL database", { timeout: 10000 }, async () => {
  await connectToBackend();
  await makeTestDatabase(); // Let SQLFoo classes use the test database

  // Fake data
  appGlobal.me = fakeChatPerson();
  let originalAccount = fakeMeetAccount();
  appGlobal.meetAccounts.add(originalAccount);
  expect(originalAccount).toBeDefined();

  // Save
  await SQLMeetAccount.save(originalAccount);
  expect(originalAccount.dbID).toBeDefined();

  // Clear
  appGlobal.meetAccounts.clear();

  // Read
  let readAccounts = await SQLMeetAccount.readAll();
  expect(readAccounts.length).toBeGreaterThan(0);
  for (let readAccount of readAccounts) {
    expect(readAccount.dbID).toBeDefined();
  }
  expect(appGlobal.meetAccounts.length).toBe(0);
  appGlobal.meetAccounts.addAll(readAccounts);
  expect(appGlobal.meetAccounts.length).toBeGreaterThan(0);

  // Check and verify
  // Account
  let readAccount = appGlobal.meetAccounts.first;
  expect(readAccount).toBeDefined();
  expect(readAccount.dbID).toBeDefined();
  expect(readAccount.protocol).toEqual(originalAccount.protocol);
  expect(readAccount.name).toEqual(originalAccount.name);
  expect(readAccount.username).toEqual(originalAccount.username);
  expect(readAccount.realname).toEqual(originalAccount.realname);
  expect(readAccount.url).toEqual(originalAccount.url);
});

async function connectToBackend() {
  let jpc = new JPCWebSocket(null);
  const kSecret = 'eyache5C';
  await jpc.connect(kSecret, "localhost", 5455);
  appGlobal.remoteApp = await jpc.getRemoteStartObject();
}
