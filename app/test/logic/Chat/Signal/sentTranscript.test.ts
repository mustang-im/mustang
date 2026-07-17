/** A message sent from a linked (companion) device must be mirrored to our own
 * other devices (the user's phone) via a SyncMessage.Sent transcript, or the
 * primary never shows what the companion sent. */
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { SignalAccount } from "../../../../logic/Chat/Signal/SignalAccount";
import { Signal1to1ChatRoom } from "../../../../logic/Chat/Signal/Signal1to1ChatRoom";
import { SignalGroupChatRoom } from "../../../../logic/Chat/Signal/SignalGroupChatRoom";
import { SignalContact } from "../../../../logic/Chat/Signal/SignalContact";
import { ServiceId } from "../../../../logic/Chat/Signal/ServiceId";
import type { Content } from "../../../../logic/Chat/Signal/Proto/signalService";
import { bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { hexToBytes } from "@noble/curves/utils.js";
import { expect, test } from "vitest";

class CaptureAccount extends SignalAccount {
  sent: { recipients: ServiceId[], content: Content, timestamp: number }[] = [];
  override async sendContent(recipients: ServiceId[], content: Content, timestamp: number): Promise<void> {
    this.sent.push({ recipients, content, timestamp });
  }
}

function account(): CaptureAccount {
  let acc = new CaptureAccount();
  acc.aci = ServiceId.aci(hexToBytes("659aa5f4a28dfcc11ea1b997537a3d95"));
  acc.deviceID = 2; // a companion is never device 1
  return acc;
}

test("1:1 send mirrors a Sent transcript to our own account, naming the peer", async () => {
  let acc = account();
  let partner = new SignalContact(ServiceId.aci(hexToBytes("11112222333344445555666677778888")));
  let room = new Signal1to1ChatRoom(acc);
  room.contact = partner;

  await acc.sendSentTranscript(room, { message: { body: "hi", timestamp: 123 } }, 123);

  expect(acc.sent).toHaveLength(1);
  let { recipients, content } = acc.sent[0];
  expect(recipients).toEqual([acc.aci]); // delivered to our own devices
  let sent = content.syncMessage!.sent!;
  expect(sent.message!.body).toBe("hi");
  expect(sent.timestamp).toBe(123);
  expect(sent.destinationServiceIdBinary &&
    bytesEqual(sent.destinationServiceIdBinary, partner.serviceId.serviceIdFixedWidthBinary())).toBe(true);
});

test("sendToRoom sends to the room's recipients and mirrors to self in one call", async () => {
  let acc = account();
  let partner = new SignalContact(ServiceId.aci(hexToBytes("11112222333344445555666677778888")));
  let room = new Signal1to1ChatRoom(acc);
  room.contact = partner;

  await acc.sendToRoom(room, { message: { body: "hi", timestamp: 9 } }, 9);

  expect(acc.sent).toHaveLength(2);
  expect(acc.sent[0].recipients).toEqual([partner.serviceId]); // to the peer…
  expect(acc.sent[0].content.dataMessage!.body).toBe("hi");
  expect(acc.sent[1].recipients).toEqual([acc.aci]);            // …and to ourselves
  expect(acc.sent[1].content.syncMessage!.sent!.message!.body).toBe("hi");
});

test("an edit mirrors a Sent transcript carrying the editMessage", async () => {
  let acc = account();
  let room = new Signal1to1ChatRoom(acc);
  room.contact = new SignalContact(ServiceId.aci(hexToBytes("11112222333344445555666677778888")));

  await acc.sendSentTranscript(room, { editMessage: { targetSentTimestamp: 100, dataMessage: { body: "fixed", timestamp: 200 } } }, 200);

  let sent = acc.sent[0].content.syncMessage!.sent!;
  expect(sent.editMessage!.targetSentTimestamp).toBe(100);
  expect(sent.editMessage!.dataMessage!.body).toBe("fixed");
  expect(sent.message).toBeUndefined();
});

test("group send mirrors a Sent transcript with no destination (the group is in groupV2)", async () => {
  let acc = account();
  let room = new SignalGroupChatRoom(acc);
  let data = { timestamp: 5, groupV2: { masterKey: hexToBytes("aa".repeat(32)) } };

  await acc.sendSentTranscript(room, { message: data }, 5);

  let sent = acc.sent[0].content.syncMessage!.sent!;
  expect(sent.destinationServiceIdBinary).toBeUndefined();
  expect(sent.message!.groupV2!.masterKey!.length).toBe(32);
});

test("reading an incoming message mirrors a SyncMessage.Read to our own devices", async () => {
  let acc = account();
  let sender = ServiceId.aci(hexToBytes("11112222333344445555666677778888"));

  await acc.sendReadSync(sender, 777);

  let { recipients, content } = acc.sent[0];
  expect(recipients).toEqual([acc.aci]);
  let read = content.syncMessage!.read![0];
  expect(read.timestamp).toBe(777);
  expect(read.senderAciBinary && bytesEqual(read.senderAciBinary, sender.serviceIdBinary())).toBe(true);
});
