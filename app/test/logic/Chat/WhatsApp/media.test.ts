// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { WhatsAppMessage } from "../../../../logic/Chat/WhatsApp/WhatsAppMessage";
import { encodeWAMessage, decodeWAMessage, type WAMessage } from "../../../../logic/Chat/Signal/Proto/schema";
import { MediaType, encryptMedia, decryptMedia } from "../../../../logic/Chat/WhatsApp/Crypto/mediaCrypto";
import { mediaDescriptorFor, downloadMedia, checkMediaURL, uploadMedia, buildMediaMessage, mediaTypeForMIME } from "../../../../logic/Chat/WhatsApp/WhatsAppMedia";
import { randomBytes, bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { WhatsAppContact } from "../../../../logic/Chat/WhatsApp/WhatsAppContact";
import { JID } from "../../../../logic/Chat/WhatsApp/Binary/JID";
import { WANode } from "../../../../logic/Chat/WhatsApp/Binary/WANode";
import { expect, test } from "vitest";

let peer = JID.parse("412300000000@s.whatsapp.net");

/** Parses a payload into a WhatsAppMessage, exercising the protobuf schema
 * (encode→decode, like the wire) and the message's own interpretation. The room
 * carries the (stubbed) connection used for the background media download. */
function parse(fields: WAMessage, account?: any): WhatsAppMessage {
  let room = { contact: new WhatsAppContact(peer, "Alice"), account } as any;
  let message = new WhatsAppMessage(room);
  message.readContent(WhatsAppMessage.unwrap(decodeWAMessage(encodeWAMessage(fields))));
  return message;
}

test("decodes an image message into a download descriptor", () => {
  let mediaKey = randomBytes(32);
  let fileEncSHA256 = randomBytes(32);
  let wire = encodeWAMessage({
    imageMessage: {
      mimetype: "image/jpeg", caption: "look", fileLength: 4096,
      mediaKey, fileEncSHA256, directPath: "/v/t62.7118-24/abc",
    },
  });
  let decoded = decodeWAMessage(wire);
  let descriptor = mediaDescriptorFor(decoded.imageMessage!, MediaType.Image);
  expect(descriptor).not.toBeNull();
  expect(descriptor!.type).toBe(MediaType.Image);
  expect(descriptor!.directPath).toBe("/v/t62.7118-24/abc");
  expect(descriptor!.fileLength).toBe(4096);
  expect(bytesEqual(descriptor!.mediaKey, mediaKey)).toBe(true);
  expect(bytesEqual(descriptor!.fileEncSHA256!, fileEncSHA256)).toBe(true);
});

test("descriptor is null when there is no key or location to fetch", () => {
  expect(mediaDescriptorFor({ mimetype: "image/jpeg" } as any, MediaType.Image)).toBeNull();
  expect(mediaDescriptorFor({ mediaKey: randomBytes(32) } as any, MediaType.Image)).toBeNull(); // no path/url
  expect(mediaDescriptorFor({ directPath: "/v/x" } as any, MediaType.Image)).toBeNull(); // no key
});

test("each media type's HKDF keys round-trip through encrypt/decrypt", async () => {
  let plaintext = randomBytes(5000);
  let mediaKey = randomBytes(32);
  for (let type of [MediaType.Image, MediaType.Video, MediaType.Audio, MediaType.Document, MediaType.Sticker]) {
    let enc = await encryptMedia(plaintext, mediaKey, type);
    let dec = await decryptMedia(enc.enc, mediaKey, type, enc.fileEncSHA256);
    expect(bytesEqual(dec, plaintext)).toBe(true);
  }
});

test("sticker reuses the image keys, but distinct types do not", async () => {
  let plaintext = randomBytes(1000);
  let mediaKey = randomBytes(32);
  let imageEnc = await encryptMedia(plaintext, mediaKey, MediaType.Image);
  // Sticker shares "WhatsApp Image Keys", so it decrypts image-encrypted bytes.
  expect(bytesEqual(await decryptMedia(imageEnc.enc, mediaKey, MediaType.Sticker), plaintext)).toBe(true);
  // A different type derives different keys, so the MAC check must fail.
  await expect(decryptMedia(imageEnc.enc, mediaKey, MediaType.Video)).rejects.toThrow();
  await expect(decryptMedia(imageEnc.enc, mediaKey, MediaType.Audio)).rejects.toThrow();
});

test("downloadMedia resolves the CDN host, fetches and decrypts", async () => {
  let plaintext = new TextEncoder().encode("hello media");
  let mediaKey = randomBytes(32);
  let enc = await encryptMedia(plaintext, mediaKey, MediaType.Document);
  let requested = "";
  appGlobal.remoteApp = {
    kyCreate: async () => ({
      get: async (url: string) => { requested = url; return enc.enc.buffer.slice(enc.enc.byteOffset, enc.enc.byteOffset + enc.enc.byteLength); },
    }),
  };
  let connection = {
    sendIQ: async () => new WANode("iq", {}, [
      new WANode("media_conn", { auth: "TOKEN" }, [new WANode("host", { hostname: "mmg.example.net" })]),
    ]),
  } as any;

  let bytes = await downloadMedia(connection, {
    type: MediaType.Document, directPath: "/v/doc", mediaKey,
    fileEncSHA256: enc.fileEncSHA256, fileSHA256: enc.fileSHA256,
  });
  expect(requested).toBe("https://mmg.example.net/v/doc&auth=TOKEN");
  expect(new TextDecoder().decode(bytes)).toBe("hello media");
});

test("uploadMedia encrypts, posts to the CDN, and the bytes round-trip", async () => {
  let plaintext = new TextEncoder().encode("upload me");
  let posted: { url: string, body: any } | null = null;
  appGlobal.remoteApp = {
    kyCreate: async () => ({
      post: async (url: string, options: any) => {
        posted = { url, body: options.body };
        return { url: "https://media.example.net/v/up", direct_path: "/v/up" };
      },
    }),
  };
  let connection = {
    sendIQ: async () => new WANode("iq", {}, [
      new WANode("media_conn", { auth: "AUTH=" }, [new WANode("host", { hostname: "media.example.net" })]),
    ]),
  } as any;

  let upload = await uploadMedia(connection, plaintext, MediaType.Document);
  expect(posted).not.toBeNull();
  // URL shape: https://<host>/mms/<type>/<token>?auth=<urlencoded>&token=<token>
  expect(posted!.url).toMatch(/^https:\/\/media\.example\.net\/mms\/document\/[A-Za-z0-9_-]+\?auth=AUTH%3D&token=[A-Za-z0-9_-]+$/);
  expect(upload.directPath).toBe("/v/up");
  expect(upload.url).toBe("https://media.example.net/v/up");
  // The recipient downloads `body` and decrypts with the returned key — round-trip.
  let decrypted = await decryptMedia(new Uint8Array(posted!.body), upload.mediaKey, MediaType.Document, upload.encrypted.fileEncSHA256);
  expect(new TextDecoder().decode(decrypted)).toBe("upload me");
});

test("buildMediaMessage round-trips into a parseable download descriptor", () => {
  let mediaKey = randomBytes(32);
  let encrypted = { enc: new Uint8Array(), fileEncSHA256: randomBytes(32), fileSHA256: randomBytes(32), fileLength: 1234 };
  let upload = { url: "", directPath: "/v/t62/abc", mediaKey, encrypted };
  let payload = buildMediaMessage(MediaType.Image, "image/jpeg", "pic.jpg", upload, "look at this");
  // Encode→decode like the wire, then parse it back the way a recipient would.
  let decoded = decodeWAMessage(encodeWAMessage(payload));
  expect(decoded.imageMessage!.caption).toBe("look at this");
  let descriptor = mediaDescriptorFor(decoded.imageMessage!, MediaType.Image);
  expect(descriptor).not.toBeNull();
  expect(descriptor!.directPath).toBe("/v/t62/abc");
  expect(descriptor!.fileLength).toBe(1234);
  expect(bytesEqual(descriptor!.mediaKey, mediaKey)).toBe(true);
  expect(bytesEqual(descriptor!.fileEncSHA256!, encrypted.fileEncSHA256)).toBe(true);
});

test("mediaTypeForMIME maps images, video, audio, and falls back to document", () => {
  expect(mediaTypeForMIME("image/png")).toBe(MediaType.Image);
  expect(mediaTypeForMIME("video/mp4")).toBe(MediaType.Video);
  expect(mediaTypeForMIME("audio/ogg")).toBe(MediaType.Audio);
  expect(mediaTypeForMIME("application/pdf")).toBe(MediaType.Document);
  expect(mediaTypeForMIME("")).toBe(MediaType.Document);
});

test("uploadMedia refuses a media host off the allowlist (SSRF guard)", async () => {
  appGlobal.remoteApp = { kyCreate: async () => ({ post: async () => ({}) }) };
  let connection = {
    sendIQ: async () => new WANode("iq", {}, [
      new WANode("media_conn", { auth: "T" }, [new WANode("host", { hostname: "internal.corp.local" })]),
    ]),
  } as any;
  await expect(uploadMedia(connection, new Uint8Array([1, 2, 3]), MediaType.Image)).rejects.toThrow(/untrusted/i);
});

test("checkMediaURL allows only https WhatsApp hosts (SSRF guard)", () => {
  expect(checkMediaURL("https://mmg.whatsapp.net/v/x")).toBe("https://mmg.whatsapp.net/v/x");
  expect(checkMediaURL("https://media-fra.cdn.whatsapp.net/x")).toBe("https://media-fra.cdn.whatsapp.net/x");
  expect(checkMediaURL("https://pps.example.net/a.jpg")).toBe("https://pps.example.net/a.jpg"); // reserved example domain, for tests
  expect(() => checkMediaURL("https://localhost:8080/x")).toThrow();
  expect(() => checkMediaURL("https://192.168.1.1/x")).toThrow();
  expect(() => checkMediaURL("https://evil.example.org/x")).toThrow(); // example.org is not allowlisted
  expect(() => checkMediaURL("https://mmg.whatsapp.net.evil.com/x")).toThrow(); // suffix trick
  expect(() => checkMediaURL("https://mmg.whatsapp.net@evil.com/x")).toThrow(); // userinfo trick
  expect(() => checkMediaURL("http://mmg.whatsapp.net/x")).toThrow(); // https only
  expect(() => checkMediaURL("file:///etc/passwd")).toThrow();
});

test("downloadMedia refuses a media host the server points us at off-allowlist", async () => {
  let connection = {
    sendIQ: async () => new WANode("iq", {}, [
      new WANode("media_conn", { auth: "T" }, [new WANode("host", { hostname: "internal.corp.local" })]),
    ]),
  } as any;
  await expect(downloadMedia(connection, {
    type: MediaType.Document, directPath: "/v/doc", mediaKey: randomBytes(32),
  })).rejects.toThrow(/untrusted/i);
});

test("downloadMedia refuses a sender-supplied url to an arbitrary host", async () => {
  await expect(downloadMedia(null, {
    type: MediaType.Image, directPath: "", url: "https://attacker.test/payload", mediaKey: randomBytes(32),
  })).rejects.toThrow(/untrusted/i);
});

test("addMedia downloads and attaches the bytes in the background", async () => {
  let plaintext = new TextEncoder().encode("a tiny document");
  let mediaKey = randomBytes(32);
  let enc = await encryptMedia(plaintext, mediaKey, MediaType.Document);
  appGlobal.remoteApp = {
    kyCreate: async () => ({
      get: async () => enc.enc.buffer.slice(enc.enc.byteOffset, enc.enc.byteOffset + enc.enc.byteLength),
    }),
  };
  let account = {
    connection: { sendIQ: async () => new WANode("iq", {}, [new WANode("media_conn", { auth: "T" })]) },
  };

  let message = parse({
    documentMessage: {
      mimetype: "application/pdf", fileName: "report.pdf", fileLength: plaintext.length,
      mediaKey, fileEncSHA256: enc.fileEncSHA256, fileSHA256: enc.fileSHA256, directPath: "/v/doc",
    },
  }, account);
  let attachment = message.attachments.first;
  expect(attachment.filename).toBe("report.pdf");
  expect(attachment.content).toBeUndefined(); // not downloaded synchronously

  await message.mediaDownload; // background download settles
  expect(attachment.content).toBeInstanceOf(File);
  expect(attachment.size).toBe(plaintext.length);
  expect(await attachment.content.text()).toBe("a tiny document");
});
