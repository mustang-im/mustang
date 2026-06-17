/** Persistence round-trip: the protocol-specific state the SQL layer stores in the
 * `json` column via toExtraJSON/fromExtraJSON must come back identical after a restart.
 * Pure-logic (no DB): exercises the exact hooks SQLChatMessage/SQLChatRoom call. */
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { SignalChatMessage } from "../../../../logic/Chat/Signal/SignalChatMessage";
import { SignalGroupChatRoom } from "../../../../logic/Chat/Signal/SignalGroupChatRoom";
import { SignalGroup } from "../../../../logic/Chat/Signal/Groups/Group";
import { randomBytes, bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

test("SignalChatMessage state round-trips (sentTimestamp from id + deleted/edited/sealedSender)", () => {
  let msg = new SignalChatMessage(null as any);
  msg.setSentTimestamp(1781600000000);
  msg.deleted = true;
  msg.edited = true;
  msg.sealedSender = true;
  let json = msg.toExtraJSON();

  // The SQL layer restores `id` from idStr, then calls fromExtraJSON.
  let restored = new SignalChatMessage(null as any);
  restored.id = msg.id;
  restored.fromExtraJSON(json);

  expect(restored.sentTimestamp).toBe(1781600000000); // derived from the persisted id
  expect(restored.deleted).toBe(true);
  expect(restored.edited).toBe(true);
  expect(restored.sealedSender).toBe(true);
});

test("SignalGroupChatRoom state round-trips (masterKey + revision rebuild the group)", () => {
  let room = new SignalGroupChatRoom(null as any);
  let masterKey = randomBytes(32);
  room.masterKey = masterKey;
  room.revision = 7;
  let json = room.toExtraJSON();

  let restored = new SignalGroupChatRoom(null as any);
  restored.fromExtraJSON(json);

  expect(restored.masterKey && bytesEqual(restored.masterKey, masterKey)).toBe(true);
  expect(restored.revision).toBe(7);
  expect(restored.group).toBeTruthy();
  expect(restored.groupId && bytesEqual(restored.groupId, new SignalGroup(masterKey).groupId)).toBe(true);
});
