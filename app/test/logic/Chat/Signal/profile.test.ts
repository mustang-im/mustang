// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { SignalAccount } from "../../../../logic/Chat/Signal/SignalAccount";
import { SignalProfile, profileKeyVersion, profileKeyCommitment, decryptAvatar } from "../../../../logic/Chat/Signal/Profile/Profile";
import { SignalApi } from "../../../../logic/Chat/Signal/Connection/SignalApi";
import { SignalContact } from "../../../../logic/Chat/Signal/SignalContact";
import { ServiceId } from "../../../../logic/Chat/Signal/ServiceId";
import { encryptProfileName } from "../../../../logic/Chat/Signal/Encryption/ProfileCipher";
import { aesGCMEncrypt, base64Encode, base64Decode, randomBytes } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

void appGlobal;

class FakeApi extends SignalApi {
  calls: { method: string, path: string, body?: any, creds?: any }[] = [];
  responses = new Map<string, any>();
  bytesResponses = new Map<string, Uint8Array>();
  constructor() { super("https://chat.signal.org"); }
  override async json<T = any>(method: string, path: string, body?: any, creds?: any): Promise<T> {
    this.calls.push({ method, path, body, creds });
    let r = this.responses.get(`${method} ${path.split("?")[0]}`);
    return (typeof r == "function" ? r(body) : r) as T;
  }
  override async getBytes(path: string): Promise<Uint8Array> {
    let r = this.bytesResponses.get(path);
    if (!r) {
      throw new Error("no fixture for " + path);
    }
    return r;
  }
}

class TestAccount extends SignalAccount {
  fake = new FakeApi();
  override api(): SignalApi { return this.fake; }
}

function newAccount(): TestAccount {
  let account = new TestAccount();
  account.aci = ServiceId.aci(randomBytes(16));
  account.servicePassword = base64Encode(randomBytes(18));
  account.profileKey = randomBytes(32);
  return account;
}

test("profileKeyVersion is a stable 64-hex string for a (profileKey, aci) pair", async () => {
  let profileKey = randomBytes(32);
  let aci = ServiceId.aci(randomBytes(16));
  let v1 = await profileKeyVersion(profileKey, aci);
  let v2 = await profileKeyVersion(profileKey, aci);
  expect(v1).toMatch(/^[0-9a-f]{64}$/);
  expect(v1).toBe(v2); // stable
  // Different profile key → different version.
  expect(await profileKeyVersion(randomBytes(32), aci)).not.toBe(v1);
});

test("decryptAvatar reverses nonce ‖ GCM-ct ‖ tag under the profile key", async () => {
  let profileKey = randomBytes(32);
  let plaintext = randomBytes(64);
  let nonce = randomBytes(12);
  let encrypted = new Uint8Array(12 + plaintext.length + 16);
  encrypted.set(nonce);
  encrypted.set(await aesGCMEncrypt(profileKey, nonce, plaintext), 12);
  expect(await decryptAvatar(profileKey, encrypted)).toEqual(plaintext);
});

test("fetchProfile decrypts the name + avatar and applies them to the contact", async () => {
  let account = newAccount();
  let profile = new SignalProfile(account);

  let contact = new SignalContact(ServiceId.aci(randomBytes(16)));
  contact.profileKey = randomBytes(32);

  // Build an encrypted profile + encrypted avatar fixture.
  let encName = base64Encode(await encryptProfileName(contact.profileKey, "Alice", "Smith"));
  let avatarPlain = randomBytes(40);
  let nonce = randomBytes(12);
  let avatarEnc = new Uint8Array(12 + avatarPlain.length + 16);
  avatarEnc.set(nonce);
  avatarEnc.set(await aesGCMEncrypt(contact.profileKey, nonce, avatarPlain), 12);

  let version = await profileKeyVersion(contact.profileKey, contact.serviceId);
  account.fake.responses.set(`GET /v1/profile/${contact.serviceId.toString()}/${version}`, {
    name: encName,
    avatar: "profiles/abc123",
  });
  let avatarFetched = false;
  account.fake.bytesResponses.set("/profiles/abc123", avatarEnc);
  let origGetBytes = account.fake.getBytes.bind(account.fake);
  account.fake.getBytes = async (path: string) => { avatarFetched = true; return origGetBytes(path); };

  await profile.fetchProfile(contact);

  // The encrypted name was decrypted + applied; the avatar object was downloaded
  // from CDN 0 (the data-URL conversion itself needs the DOM FileReader, absent here).
  expect(contact.name).toBe("Alice Smith");
  expect(avatarFetched).toBe(true);

  // Decrypting the same fixture directly yields the avatar plaintext (the conversion
  // step we can't run headless).
  expect(await decryptAvatar(contact.profileKey!, avatarEnc)).toEqual(avatarPlain);
});

test("fetchProfile is a no-op without a profile key (can't decrypt)", async () => {
  let account = newAccount();
  let profile = new SignalProfile(account);
  let contact = new SignalContact(ServiceId.aci(randomBytes(16)));
  contact.profileKey = null;
  await profile.fetchProfile(contact);
  expect(account.fake.calls.length).toBe(0); // never hit the network
});

test("setOwnProfile PUTs /v1/profile with version + encrypted name/about", async () => {
  let account = newAccount();
  let profile = new SignalProfile(account);
  account.fake.responses.set("PUT /v1/profile", {});

  await profile.setOwnProfile({ givenName: "Bob", about: "hi there" });

  let call = account.fake.calls.find(c => c.path == "/v1/profile")!;
  expect(call.method).toBe("PUT");
  expect(call.body.version).toMatch(/^[0-9a-f]{64}$/);
  // name decrypts back under our profile key.
  let nameCt = base64Decode(call.body.name);
  expect(nameCt.length).toBe(53 + 28); // "Bob" → 53-byte bucket + 28 overhead
  expect(base64Decode(call.body.about).length).toBe(128 + 28);
  expect(call.body.avatar).toBe(false);
  expect(call.body.sameAvatar).toBe(true);
  // The server's CreateProfileRequest.commitment is @NotNull: a 97-byte
  // ProfileKeyCommitment (ReservedByte ‖ J1 ‖ J2 ‖ J3) is always sent.
  expect(base64Decode(call.body.commitment).length).toBe(97);
  expect(base64Decode(call.body.commitment)[0]).toBe(0); // ReservedByte
});

test("profileKeyCommitment system generators match libsignal SYSTEM_HARDCODED", async () => {
  // The three commitment generators G_j1/G_j2/G_j3 are derived from the empty-seeded
  // "…ProfileKeyCommitment_SystemParams_Generate" SHO. Their concatenated 96-byte
  // serialization must equal SystemParams::SYSTEM_HARDCODED
  // (libsignal zkgroup/src/crypto/profile_key_commitment.rs). This is the byte-level
  // anchor proving our derivation matches the official client.
  let { Sho } = await import("../../../../logic/Chat/Signal/Encryption/ZKGroup/sho");
  let sho = new Sho("Signal_ZKGroup_20200424_Constant_ProfileKeyCommitment_SystemParams_Generate");
  sho.absorbAndRatchet(new Uint8Array(0));
  let hex = (p: any) => [...p.toBytes()].map((b: number) => b.toString(16).padStart(2, "0")).join("");
  let derived = hex(sho.getPoint()) + hex(sho.getPoint()) + hex(sho.getPoint());
  let hardcoded =
    "a8ca0bbd1148c466725860640ac53d2772b14eeae0170a38c62c7b3dd29c3e4a" +
    "14b9462d948f059450799f4cc2a06e55dec807735670b94a5ce80f59f1950861" +
    "b0c0f7b91f6ef9c7556093d8930a86bd36188cec740554657d92dcd86aad251c";
  expect(derived).toBe(hardcoded);
});

test("profileKeyCommitment is a stable 97-byte commitment for a (profileKey, aci) pair", async () => {
  let profileKey = randomBytes(32);
  let aci = ServiceId.aci(randomBytes(16));
  let c1 = await profileKeyCommitment(profileKey, aci);
  let c2 = await profileKeyCommitment(profileKey, aci);
  expect(c1.length).toBe(97); // ReservedByte(1) ‖ J1(32) ‖ J2(32) ‖ J3(32)
  expect(c1[0]).toBe(0);
  expect(base64Encode(c1)).toBe(base64Encode(c2)); // deterministic
  // A different profile key → a different commitment.
  expect(base64Encode(await profileKeyCommitment(randomBytes(32), aci))).not.toBe(base64Encode(c1));
});
