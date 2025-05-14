import { makeTestDatabase } from './SQLDatabase';
import { ChatMessage } from '../Message';
import { SQLChatAccount } from './SQLChatAccount';
import { SQLChat } from './SQLChat';
import { SQLChatMessage } from './SQLChatMessage';
import { FakeChatAccount, FakeChatPerson, FakeAddressbook, fakePersons } from '../../testData';
import { SQLPerson } from '../../Contacts/SQL/SQLPerson';
import { appGlobal } from '../../app';
import JPCWebSocket from '../../../../lib/jpc-ws/protocol';
import { ArrayColl } from 'svelte-collections';
import { expect, test } from 'vitest';

test("Save and read chats from SQL database", { timeout: 10000 }, async () => {
  await connectToBackend();
  await makeTestDatabase(); // Let SQLFoo classes use the test database

  // Fake data
  appGlobal.me = new FakeChatPerson();
  let addressbook = new FakeAddressbook();
  fakePersons(50, addressbook);
  let originalAccount = new FakeChatAccount(addressbook.persons, appGlobal.me, 30);
  expect(originalAccount).toBeDefined();
  appGlobal.chatAccounts.add(originalAccount);
  let originalChats = originalAccount.chats;
  expect(originalChats.length).toBeGreaterThan(2);
  let originalMessages = new ArrayColl<ChatMessage>();
  for (let chat of originalChats) {
    originalMessages.addAll(chat.messages as any as ArrayColl<ChatMessage>);
  }
  expect(originalMessages.length).toBeGreaterThan(10);
  let personID = 0;
  SQLPerson.save = async (p) => { p.dbID = ++personID };

  // Save
  await SQLChatAccount.save(originalAccount);
  for (let chat of originalChats) {
    await SQLChat.save(chat);
    for (let msg of chat.messages) {
      await SQLChatMessage.save(msg as any as ChatMessage);
    }
  }

  // Clear
  appGlobal.chatAccounts.clear();

  // Read
  appGlobal.chatAccounts.addAll(await SQLChatAccount.readAll());
  for (let account of appGlobal.chatAccounts) {
    await SQLChat.readAll(account);
    for (let chat of account.chats) {
      await SQLChatMessage.readAll(chat);
    }
  }

  // Check and verify
  // Account
  let readAccount = appGlobal.chatAccounts.first;
  expect(readAccount).toBeDefined();
  expect(readAccount.username).toEqual(originalAccount.username);
  expect(readAccount.realname).toEqual(originalAccount.realname);
  expect(readAccount.hostname).toEqual(originalAccount.hostname);
  expect(readAccount.port).toEqual(originalAccount.port);
  expect(readAccount.tls).toEqual(originalAccount.tls);
  expect(readAccount.url).toEqual(originalAccount.url);
  expect(readAccount.dbID).toEqual(originalAccount.dbID);

  // Chat
  let readChats = readAccount.chats;
  for (let originalChat of originalChats) {
    let readChat = readChats.find(f =>
      f.id == originalChat.id &&
      f.account.id == originalChat.account.id);
    expect(readChat).toBeDefined();
    expect(readChat.name).toEqual(originalChat.name);
    expect(readChat.messages.length).toEqual(originalChat.messages.length);

    // Message
    for (let originalMessage of originalChat.messages) {
      let readMessage = readChat.messages.find(msg =>
        msg.id == originalMessage.id);
      expect(readMessage).toBeDefined();
      expect(readMessage.text).toEqual(originalMessage.text);
      expect(readMessage.html).toEqual(originalMessage.html);
      expect(readMessage.contact.name).toEqual(originalMessage.contact.name);
      expect(readMessage.contact.id).toEqual(originalMessage.contact.id);
      expect(readMessage.contact.name).toEqual(originalMessage.contact.name);
    }
  }
});

async function connectToBackend() {
  let jpc = new JPCWebSocket(null);
  const kSecret = 'eyache5C';
  await jpc.connect(kSecret, "localhost", 5455);
  appGlobal.remoteApp = await jpc.getRemoteStartObject();
}
