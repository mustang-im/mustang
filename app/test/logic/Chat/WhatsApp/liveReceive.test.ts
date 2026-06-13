// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { WhatsAppAccount } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
import { JID } from "../../../../logic/Chat/WhatsApp/Binary/JID";
import { DummyChatStorage } from "../../../../logic/Chat/SQL/DummyChatStorage";
import { Addressbook } from "../../../../logic/Contacts/Addressbook";
import { DummyAddressbookStorage } from "../../../../logic/Contacts/SQL/DummyAddressbookStorage";
import { ContactEntry, Person } from "../../../../logic/Abstract/Person";
import { Group } from "../../../../logic/Abstract/Group";
import { encode } from "../../../../logic/Chat/WhatsApp/Proto/codec";
import { HistorySync, decodeHistorySync } from "../../../../logic/Chat/WhatsApp/Proto/schema";
import { WANode } from "../../../../logic/Chat/WhatsApp/Binary/WANode";
import { SignalStore } from "../../../../logic/Chat/WhatsApp/Crypto/Signal/Store";
import { createSenderKey, createDistributionMessage } from "../../../../logic/Chat/WhatsApp/Crypto/Signal/GroupCipher";
import { expect, test } from "vitest";

const kAliceJID = "491761111111@s.whatsapp.net";
const kBobJID = "491762222222@s.whatsapp.net";
const kGroupJID = "12345-67890@g.us";

/** A WhatsApp account with an empty personal address book, both backed by no-op
 * storage so we exercise only the in-memory room/contact creation. */
function setup(): WhatsAppAccount {
  appGlobal.addressbooks.clear();
  appGlobal.chatAccounts.clear();
  let addressbook = new Addressbook();
  addressbook.name = "Personal";
  addressbook.storage = new DummyAddressbookStorage();
  appGlobal.addressbooks.add(addressbook);
  appGlobal.personalAddressbook = addressbook;
  let account = new WhatsAppAccount();
  account.storage = new DummyChatStorage();
  appGlobal.chatAccounts.add(account);
  appGlobal.me = new Person();
  appGlobal.me.name = "Me";
  return account;
}

test("auto-creates a 1:1 room and contact on the first message, reusing them after", async () => {
  let account = setup();

  let room = await account.getOrCreateRoom(JID.parse(kAliceJID), "Alice Liveexample");
  expect(account.rooms.length).toBe(1);
  expect(room.id).toBe(kAliceJID);
  expect(room.contact).toBeInstanceOf(Person);
  expect(room.contact.name).toBe("Alice Liveexample"); // taken from the stanza's push name
  let person = room.contact as any as Person;
  expect(person.phoneNumbers.some(e => e.value == "+491761111111")).toBe(true);
  expect(person.chatAccounts.some(e => e.protocol == "whatsapp" && e.value == kAliceJID)).toBe(true);
  expect(appGlobal.personalAddressbook.persons.length).toBe(1);

  // A later message — even from a specific device JID — reuses the same room.
  let again = await account.getOrCreateRoom(JID.parse("491761111111:7@s.whatsapp.net"), "Alice Liveexample");
  expect(again).toBe(room);
  expect(account.rooms.length).toBe(1);
  expect(appGlobal.personalAddressbook.persons.length).toBe(1);
});

test("auto-creates a group room on the first group message", async () => {
  let account = setup();

  let room = await account.getOrCreateRoom(JID.parse(kGroupJID));
  expect(account.rooms.length).toBe(1);
  expect(room.id).toBe(kGroupJID);
  expect(room.contact).toBeInstanceOf(Group);
});

test("reuses an existing contact matched by phone number, instead of duplicating it", async () => {
  let account = setup();
  let existing = appGlobal.personalAddressbook.newPerson();
  existing.name = "Alice Imported";
  existing.phoneNumbers.add(new ContactEntry("0176 1111111", "mobile", "tel")); // national format
  appGlobal.personalAddressbook.persons.add(existing);

  let room = await account.getOrCreateRoom(JID.parse(kAliceJID), "Alice Push");

  expect(room.contact).toBe(existing as any); // matched, not duplicated
  expect(appGlobal.personalAddressbook.persons.length).toBe(1);
  expect(existing.chatAccounts.some(e => e.protocol == "whatsapp" && e.value == kAliceJID)).toBe(true); // linked
});

test("history sync builds the chat list and back-fills old messages", async () => {
  let account = setup();

  // A HistorySync blob as the phone would send it: a 1:1 and a group, each with
  // stored messages. Encode then decode it, to exercise the real wire format.
  let blob = encode(HistorySync, {
    syncType: 2, // FULL
    conversations: [
      {
        id: kAliceJID,
        messages: [
          { message: { key: { remoteJID: kAliceJID, fromMe: false, id: "A1" }, message: { conversation: "Hello from Alice" }, messageTimestamp: 1700000000, pushName: "Alice History" } },
          { message: { key: { remoteJID: kAliceJID, fromMe: true, id: "A2" }, message: { conversation: "Hi back" }, messageTimestamp: 1700000100 } },
        ],
      },
      {
        id: kGroupJID,
        name: "Weekend Trip",
        messages: [
          { message: { key: { remoteJID: kGroupJID, fromMe: false, id: "G1", participant: kBobJID }, message: { conversation: "Group hi" }, messageTimestamp: 1700000200, pushName: "Bob" } },
        ],
      },
      {
        // A LID-keyed 1:1 (modern privacy accounts) — must still import.
        id: "111222333444@lid",
        messages: [
          { message: { key: { remoteJID: "111222333444@lid", fromMe: false, id: "L1" }, message: { conversation: "Hi over lid" }, messageTimestamp: 1700000300, pushName: "Lid Contact" } },
        ],
      },
    ],
  });

  let result = await account.historySync.importHistory(decodeHistorySync(blob));
  expect(result.chats).toBe(3);
  expect(result.messages).toBe(4);
  expect(account.rooms.length).toBe(3);
  let lidRoom = account.rooms.contents.find(room => room.id == "111222333444@lid");
  expect(lidRoom).toBeDefined();
  expect(lidRoom.messages.contents.find(msg => msg.text == "Hi over lid")).toBeDefined();

  let aliceRoom = account.rooms.contents.find(room => room.id == kAliceJID);
  expect(aliceRoom).toBeDefined();
  expect(aliceRoom.contact.name).toBe("Alice History"); // from the message push name
  expect(aliceRoom.messages.length).toBe(2);
  let hello = aliceRoom.messages.contents.find(msg => msg.text == "Hello from Alice");
  expect(hello.outgoing).toBe(false);
  expect(aliceRoom.messages.contents.find(msg => msg.text == "Hi back").outgoing).toBe(true);
  expect(aliceRoom.lastMessage.text).toBe("Hi back"); // the newest

  let groupRoom = account.rooms.contents.find(room => room.id == kGroupJID);
  expect(groupRoom).toBeDefined();
  expect(groupRoom.contact).toBeInstanceOf(Group);
  expect(groupRoom.name).toBe("Weekend Trip");
  expect(groupRoom.messages.contents.find(msg => msg.text == "Group hi")).toBeDefined();
});

test("after login it uploads prekeys and switches the connection to active", async () => {
  let account = setup();
  account.signalStore = SignalStore.createNew();
  let sentIQs: WANode[] = [];
  account.connection = {
    async sendIQ(node: WANode) {
      sentIQs.push(node);
      return new WANode("iq", { type: "result" });
    },
    async sendNode() {},
  } as any;

  await (account as any).afterLogin();
  (account as any).stopKeepAlive(); // don't leak the interval into other tests

  // The encrypt IQ publishes our identity, signed prekey and one-time prekeys —
  // without this the phone can't establish a session to send us history/messages.
  let upload = sentIQs.find(node => node.attrs.xmlns == "encrypt");
  expect(upload).toBeDefined();
  expect(upload.attrs.type).toBe("set");
  expect(upload.child("registration").contentBytes.length).toBe(4);
  expect([...upload.child("identity").contentBytes]).toEqual([...account.signalStore.identityKeyPair.publicKey]);
  expect(upload.child("list").children("key").length).toBe(account.signalStore.preKeys.size);
  let skey = upload.child("skey");
  expect([...skey.child("value").contentBytes]).toEqual([...account.signalStore.signedPreKeys.get(1).keyPair.publicKey]);
  expect(skey.child("signature").contentBytes.length).toBe(64);
  expect(skey.child("id").contentBytes.length).toBe(3);

  // The <active> IQ is what actually starts the inbound stream (offline + history).
  let active = sentIQs.find(node => node.attrs.xmlns == "passive");
  expect(active).toBeDefined();
  expect(active.attrs.type).toBe("set");
  expect(active.child("active")).toBeDefined();
});

test("stores a group sender key from an incoming SenderKeyDistributionMessage", async () => {
  let account = setup();
  account.signalStore = SignalStore.createNew();

  // A real distribution message, as a group member would send it to us.
  let distribution = createDistributionMessage(createSenderKey(7));
  let payload = {
    senderKeyDistributionMessage: { groupID: kGroupJID, axolotlSenderKeyDistributionMessage: distribution },
  };
  let sender = JID.parse(kBobJID);

  (account as any).processSenderKeyDistribution(payload, sender);

  let stored = account.signalStore.senderKeys.get(`${kGroupJID}|${sender.user}.${sender.device}`);
  expect(stored).toBeDefined();
  expect(stored.keyID).toBe(7);
});
