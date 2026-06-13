// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { XMPPMedia, isFileURL } from "../../../../logic/Chat/XMPP/XMPPMedia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

/** In-memory HTTP store standing in for the upload server */
let files = new Map<string, Uint8Array>();

function fakeAccount(): any {
  return {
    jid: "me@localhost",
    errorCallback: (ex: Error) => { throw ex; },
    client: {
      getUploadService: async () => ({ jid: "upload.localhost" }),
      getUploadSlot: async (_jid: string, req: any) => ({
        upload: { url: `https://files.localhost/${encodeURIComponent(req.name)}`, headers: [] },
        download: `https://files.localhost/${encodeURIComponent(req.name)}`,
      }),
    },
  };
}

beforeEach(() => {
  files.clear();
  vi.stubGlobal("fetch", async (url: string, options?: any) => {
    let key = url.split("#")[0];
    if (options?.method == "PUT") {
      files.set(key, new Uint8Array(options.body));
      return { ok: true } as any;
    }
    let data = files.get(key);
    return { ok: !!data, arrayBuffer: async () => data!.buffer.slice(data!.byteOffset, data!.byteOffset + data!.byteLength) } as any;
  });
});
afterEach(() => vi.unstubAllGlobals());

const text = (s: string) => new TextEncoder().encode(s);
const str = (b: Uint8Array) => new TextDecoder().decode(b);

describe("XMPP media (XEP-0363 + OMEMO aesgcm)", () => {
  test("a plain file uploads and downloads unchanged", async () => {
    let media = new XMPPMedia(fakeAccount());
    let url = await media.upload("notes.txt", text("hello file"), "text/plain");
    expect(url).toBe("https://files.localhost/notes.txt");
    expect(str(await media.download(url))).toBe("hello file");
  });

  test("an encrypted file round-trips via an aesgcm:// URL", async () => {
    let media = new XMPPMedia(fakeAccount());
    let url = await media.uploadEncrypted("photo.jpg", text("secret photo bytes"), "image/jpeg");
    expect(url.startsWith("aesgcm://files.localhost/photo.jpg#")).toBe(true);
    // fragment = hex(12-byte iv) + hex(32-byte key) = 24 + 64 = 88 hex chars
    expect(url.split("#")[1].length).toBe(88);
    // the stored blob is the ciphertext, not the plaintext
    let stored = files.get("https://files.localhost/photo.jpg")!;
    expect(str(stored)).not.toContain("secret");
    expect(str(await media.download(url))).toBe("secret photo bytes");
  });

  test("isFileURL recognizes shared-file URLs only", () => {
    expect(isFileURL("https://files.localhost/a.jpg")).toBe(true);
    expect(isFileURL("aesgcm://files.localhost/a.jpg#abcd")).toBe(true);
    expect(isFileURL("  https://x/y.png  ")).toBe(true);
    expect(isFileURL("look at https://x/y.png")).toBe(false);
    expect(isFileURL("hello world")).toBe(false);
  });
});
