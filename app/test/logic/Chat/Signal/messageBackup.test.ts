// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { ServiceId } from "../../../../logic/Chat/Signal/ServiceId";
import { deriveBackupId, deriveMessageBackupKey, decryptMessageBackup } from "../../../../logic/Chat/Signal/Encryption/MessageBackupCipher";
import { encode, decode } from "../../../../logic/Chat/Signal/Proto/codec";
import { BackupInfo, Frame, ChatItem } from "../../../../logic/Chat/Signal/Proto/backup";
import { hkdfSHA256, aesCBCEncrypt, hmacSHA256, concatBytes, randomBytes } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { hexToBytes, bytesToHex } from "@noble/curves/utils.js";
import { expect, test } from "vitest";

void appGlobal;

const FAKE_ACI = ServiceId.aci(hexToBytes("659aa5f4a28dfcc11ea1b997537a3d95"));

/** BackupKey derived from the libsignal test AccountEntropyPool (account-keys/backup.rs). */
function backupKeyFromAEP(aep: string): Uint8Array {
  return hkdfSHA256(new TextEncoder().encode(aep), new Uint8Array(0),
    new TextEncoder().encode("20240801_SIGNAL_BACKUP_KEY"), 32);
}

// Known-answer vectors copied from libsignal rust/account-keys + rust/message-backup tests.
test("backup key schedule matches libsignal known-answer vectors", () => {
  let aep = "dtjs858asj6tv0jzsqrsmj0ubp335pisj98e9ssnss8myoc08drhtcktyawvx45l";
  let backupKey = backupKeyFromAEP(aep);
  expect(bytesToHex(backupKey)).toBe("ea26a2ddb5dba5ef9e34e1b8dea1f5ae7f255306a6d2d883e542306eaa9fe985");

  let backupId = deriveBackupId(backupKey, FAKE_ACI);
  expect(bytesToHex(backupId)).toBe("8a624fbc45379043f39f1391cddc5fe8");

  // The link transfer uses the legacy (no forward-secrecy) message-backup key.
  let mbk = deriveMessageBackupKey(backupKey, FAKE_ACI);
  expect(bytesToHex(mbk.hmacKey)).toBe("f425e22a607c529717e1e1b29f9fe139f9d1c7e7d01e371c7753c544a3026649");
  expect(bytesToHex(mbk.aesKey)).toBe("e143f4ad5668d8bfed2f88562f0693f53bda2c0e55c9d71730f30e24695fd6df");
});

/** varint-length-delimit one frame (the backup stream framing). */
function delimit(bytes: Uint8Array): Uint8Array {
  let prefix: number[] = [];
  let n = bytes.length;
  do {
    let b = n & 0x7f;
    n >>>= 7;
    prefix.push(n ? b | 0x80 : b);
  } while (n);
  return concatBytes(Uint8Array.from(prefix), bytes);
}

async function gzip(data: Uint8Array): Promise<Uint8Array> {
  let stream = new CompressionStream("gzip");
  let writer = stream.writable.getWriter();
  void writer.write(data as BufferSource);
  void writer.close();
  let chunks: Uint8Array[] = [];
  let reader = stream.readable.getReader();
  for (let c = await reader.read(); !c.done; c = await reader.read()) {
    chunks.push(c.value);
  }
  return concatBytes(...chunks);
}

// End-to-end: build a backup file the way a primary would, then decrypt it back.
test("decryptMessageBackup round-trips an encrypted, gzipped frame stream", async () => {
  let backupKey = randomBytes(32);
  let { aesKey, hmacKey } = deriveMessageBackupKey(backupKey, FAKE_ACI);

  let frameStream = concatBytes(
    delimit(encode(BackupInfo, { version: 1n, backupTimeMs: 1700000000000n })),
    delimit(encode(Frame, { chat: { id: 1, recipientId: 2 } })),
  );
  let compressed = await gzip(frameStream);
  let iv = randomBytes(16);
  let ciphertext = await aesCBCEncrypt(aesKey, iv, compressed);
  let signed = concatBytes(iv, ciphertext);
  let file = concatBytes(signed, hmacSHA256(hmacKey, signed));

  let out = await decryptMessageBackup(backupKey, FAKE_ACI, file);
  expect(bytesToHex(out)).toBe(bytesToHex(frameStream));

  // and the first frame decodes as BackupInfo
  let firstLen = out[0]; // small message → single-byte varint length
  let firstFrame = out.subarray(1, 1 + firstLen);
  expect(decode(BackupInfo, firstFrame).backupTimeMs).toBe(1700000000000n);
});

// Guards the field numbers of the rich backup-frame subset against backup.proto.
test("backup proto decodes a rich chat item (attachments, reactions, quote, edits)", () => {
  let raw = encode(ChatItem, {
    chatId: 1, authorId: 2, dateSent: 123n,
    incoming: { dateReceived: 124n, read: true },
    revisions: [{ chatId: 1, dateSent: 120n }],
    standardMessage: {
      text: { body: "hi" },
      attachments: [{ pointer: {
        contentType: "image/jpeg",
        locatorInfo: { transitCdnKey: "abc", transitCdnNumber: 2, key: Uint8Array.from([1, 2, 3]), encryptedDigest: Uint8Array.from([9]), size: 10 },
      } }],
      reactions: [{ emoji: "👍", authorId: 2, sentTimestamp: 5n }],
      quote: { targetSentTimestamp: 100n, authorId: 2 },
    },
  });
  let item = decode(ChatItem, raw);
  expect(item.incoming?.read).toBe(true);
  expect(item.revisions?.length).toBe(1);
  expect(item.standardMessage?.text?.body).toBe("hi");
  expect(item.standardMessage?.attachments?.[0]?.pointer?.locatorInfo?.transitCdnKey).toBe("abc");
  expect(item.standardMessage?.attachments?.[0]?.pointer?.contentType).toBe("image/jpeg");
  expect(item.standardMessage?.reactions?.[0]?.emoji).toBe("👍");
  expect(item.standardMessage?.quote?.targetSentTimestamp).toBe(100n);
});

test("backup proto decodes group recipient + sticker item", () => {
  let frame = decode(Frame, encode(Frame, { recipient: { id: 7, group: { masterKey: new Uint8Array(32).fill(3) } } }));
  expect(frame.recipient?.id).toBe(7);
  expect(frame.recipient?.group?.masterKey?.length).toBe(32);

  let item = decode(ChatItem, encode(ChatItem, { chatId: 1, stickerMessage: { sticker: { emoji: "🎉", data: { contentType: "image/webp" } } } }));
  expect(item.stickerMessage?.sticker?.emoji).toBe("🎉");
  expect(item.stickerMessage?.sticker?.data?.contentType).toBe("image/webp");
});

test("decryptMessageBackup rejects a forward-secrecy (magic-number) file", async () => {
  let backupKey = randomBytes(32);
  let file = concatBytes(new TextEncoder().encode("SBACKUP\x01"), randomBytes(64));
  await expect(decryptMessageBackup(backupKey, FAKE_ACI, file)).rejects.toThrow(/forward-secrecy/);
});
