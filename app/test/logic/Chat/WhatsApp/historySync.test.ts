// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { WhatsAppAccount } from "../../../../logic/Chat/WhatsApp/WhatsAppAccount";
import { JID } from "../../../../logic/Chat/WhatsApp/Binary/JID";
import { DummyChatStorage } from "../../../../logic/Chat/SQL/DummyChatStorage";
import { Addressbook } from "../../../../logic/Contacts/Addressbook";
import { DummyAddressbookStorage } from "../../../../logic/Contacts/SQL/DummyAddressbookStorage";
import { Person } from "../../../../logic/Abstract/Person";
import { encode, decode } from "../../../../logic/Chat/WhatsApp/Proto/codec";
import {
  HistorySync, HistorySyncType, ProtocolMessageType, PeerDataOperationRequestType,
  PeerDataOperationRequestMessage, Message, decodeHistorySync, decodeWAMessage,
} from "../../../../logic/Chat/WhatsApp/Proto/schema";
import { expect, test } from "vitest";

const kAliceJID = "491761111111@s.whatsapp.net";
const kBobJID = "491762222222@s.whatsapp.net";

/** A WhatsApp account on no-op storage, as in liveReceive.test.ts. */
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
  account.deviceJID = JID.parse("412300000000:1@s.whatsapp.net");
  appGlobal.chatAccounts.add(account);
  appGlobal.me = new Person();
  appGlobal.me.name = "Me";
  return account;
}

/** Builds one conversation with `count` plain-text messages, ids `${prefix}N`. */
function conversationWith(id: string, prefix: string, count: number) {
  let messages = [];
  for (let i = 0; i < count; i++) {
    messages.push({
      message: {
        key: { remoteJID: id, fromMe: false, id: `${prefix}${i}` },
        message: { conversation: `${prefix} message ${i}` },
        messageTimestamp: 1700000000 + i,
        pushName: "Sender",
      },
    });
  }
  return { id, messages };
}

test("a FULL history dump imports all conversations and messages", async () => {
  let account = setup();

  // A large FULL blob: many conversations, many messages each — the shape a
  // phone pushes at link time when requireFullSync asked for the whole history.
  let conversations = [];
  for (let c = 0; c < 30; c++) {
    conversations.push(conversationWith(`49176${1000000 + c}@s.whatsapp.net`, `c${c}-`, 20));
  }
  let blob = encode(HistorySync, { syncType: HistorySyncType.Full, conversations });

  let result = await account.historySync.importHistory(decodeHistorySync(blob), HistorySyncType.Full);
  expect(result.chats).toBe(30);
  expect(result.messages).toBe(30 * 20);
  expect(account.rooms.length).toBe(30);
});

test("one unparseable message does not abort the rest of its conversation", async () => {
  let account = setup();

  // A conversation whose 2nd stored message has no `message` body (skipped) and a
  // good one before and after — both good ones must still import.
  let blob = encode(HistorySync, {
    syncType: HistorySyncType.Full,
    conversations: [{
      id: kAliceJID,
      messages: [
        { message: { key: { remoteJID: kAliceJID, fromMe: false, id: "ok1" }, message: { conversation: "before" }, messageTimestamp: 1700000000 } },
        { msgOrderID: 2 }, // no `message` — addHistoryMessage returns false, must not throw/abort
        { message: { key: { remoteJID: kAliceJID, fromMe: false, id: "ok2" }, message: { conversation: "after" }, messageTimestamp: 1700000200 } },
      ],
    }],
  });

  let result = await account.historySync.importHistory(decodeHistorySync(blob), HistorySyncType.Full);
  expect(result.chats).toBe(1);
  expect(result.messages).toBe(2); // both good ones
  let room = account.rooms.contents.find(r => r.id == kAliceJID);
  expect(room.messages.contents.find(m => m.text == "before")).toBeDefined();
  expect(room.messages.contents.find(m => m.text == "after")).toBeDefined();
});

test("a NO_HISTORY notification is a clean no-op (no download, no rooms, no throw)", async () => {
  let account = setup();
  // No connection is set, so any attempt to download would throw. A NO_HISTORY
  // notification must short-circuit before that and create nothing.
  await account.historySync.handleNotification({
    syncType: HistorySyncType.NoHistory,
    directPath: "/should-not-be-fetched",
  });
  expect(account.rooms.length).toBe(0);
});

test("on-demand request: PeerDataOperationRequestMessage round-trips on the wire", () => {
  // Encode then decode a full Message wrapping the on-demand request, to exercise
  // the real field numbers (ProtocolMessage.peerDataOperationRequestMessage=16,
  // PeerDataOperationRequestMessage{type=1, historySyncOnDemandRequest=4}, and the
  // HistorySyncOnDemandRequest fields 1..5).
  let original = {
    protocolMessage: {
      type: ProtocolMessageType.PeerDataOperationRequest,
      peerDataOperationRequestMessage: {
        peerDataOperationRequestType: PeerDataOperationRequestType.HistorySyncOnDemand,
        historySyncOnDemandRequest: {
          chatJID: kBobJID,
          oldestMsgID: "OLDEST123",
          oldestMsgFromMe: true,
          onDemandMsgCount: 50,
          oldestMsgTimestampSec: 1700000000,
        },
      },
    },
  };

  let decoded = decodeWAMessage(encode(Message, original));
  let pm = decoded.protocolMessage;
  expect(pm.type).toBe(16); // PEER_DATA_OPERATION_REQUEST_MESSAGE
  let request = pm.peerDataOperationRequestMessage;
  expect(request.peerDataOperationRequestType).toBe(3); // HISTORY_SYNC_ON_DEMAND
  let onDemand = request.historySyncOnDemandRequest;
  expect(onDemand.chatJID).toBe(kBobJID);
  expect(onDemand.oldestMsgID).toBe("OLDEST123");
  expect(onDemand.oldestMsgFromMe).toBe(true);
  expect(onDemand.onDemandMsgCount).toBe(50);
  expect(onDemand.oldestMsgTimestampSec).toBe(1700000000); // seconds, despite the *MS name

  // The standalone sub-message also round-trips (field numbers isolated).
  let bare = decode(PeerDataOperationRequestMessage,
    encode(PeerDataOperationRequestMessage, original.protocolMessage.peerDataOperationRequestMessage));
  expect(bare.historySyncOnDemandRequest.onDemandMsgCount).toBe(50);
});

test("on-demand paging is gated off by default: pageOlderMessages does nothing", async () => {
  let account = setup();
  let room = await account.getOrCreateRoom(JID.parse(kAliceJID), "Alice");
  // Even with a stored message to anchor on, the default (pageOnDemand=false)
  // must not attempt a send (account has no sendPeerMessage), so this is a no-op.
  await room.addHistoryMessage({
    key: { remoteJID: kAliceJID, fromMe: false, id: "anchor" },
    message: { conversation: "anchor" },
    messageTimestamp: 1700000000,
  } as any);
  await account.historySync.pageOlderMessages(room); // must not throw
  expect(account.historySync.pageOnDemand).toBe(false);
});
