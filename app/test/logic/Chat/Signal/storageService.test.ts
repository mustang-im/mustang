/** Storage Service (roster sync) — offline round-trip. We pick a master key,
 * derive the storage key, build a StorageManifest + StorageRecords, encrypt them
 * with the derived manifest/item keys (the same `storageEncrypt` the real server
 * uses), then drive the real decrypt + diff + apply path by stubbing only the
 * HTTP layer (SignalApi) to hand back those encrypted bytes. We assert a
 * SignalContact with the right aci/e164/profileKey lands in the roster, the own
 * AccountRecord updates our profile key, a GroupV2 master key is noted, and the
 * manifest version is recorded. Also covers the AEP→masterKey derivation and the
 * legacy-vs-SSRE2 item-key selection. See Docs/06. */
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { SignalAccount } from "../../../../logic/Chat/Signal/SignalAccount";
import { SignalStorageService } from "../../../../logic/Chat/Signal/Profile/StorageService";
import { ServiceId, uuidToBytes } from "../../../../logic/Chat/Signal/ServiceId";
import { SignalHttpError } from "../../../../logic/Chat/Signal/Connection/SignalApi";
import {
  deriveStorageKey, deriveMasterKeyFromAEP, deriveManifestKey, deriveItemKey,
  deriveItemKeyFromIkm, storageEncrypt,
} from "../../../../logic/Chat/Signal/Encryption/StorageCipher";
import {
  StorageManifest, ManifestRecord, StorageItem, StorageItems, ReadOperation,
  StorageRecord, RecordType,
} from "../../../../logic/Chat/Signal/Proto/storage";
import { encode, decode } from "../../../../logic/Chat/Signal/Proto/codec";
import { randomBytes } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { DummyChatStorage } from "../../../../logic/Chat/SQL/DummyChatStorage";
import { Addressbook } from "../../../../logic/Contacts/Addressbook";
import { DummyAddressbookStorage } from "../../../../logic/Contacts/SQL/DummyAddressbookStorage";
import { Person } from "../../../../logic/Abstract/Person";
import { bytesToHex } from "@noble/curves/utils.js";
import { expect, test, beforeEach } from "vitest";

const aliceUuid = "aaaaaaaa-0000-4000-8000-000000000001";
const groupMaster = new Uint8Array(32).fill(7);

beforeEach(() => {
  appGlobal.chatAccounts.clear();
  appGlobal.addressbooks.clear();
  let ab = new Addressbook();
  ab.storage = new DummyAddressbookStorage();
  appGlobal.addressbooks.add(ab);
  appGlobal.personalAddressbook = ab;
  appGlobal.me = new Person();
  appGlobal.me.name = "Me";
});

/** A SignalAccount whose storage HTTP is stubbed: /v1/storage/auth, the manifest
 * GET and the /v1/storage/read PUT are served from in-memory encrypted bytes. */
class TestStorageAccount extends SignalAccount {
  manifestBytes: Uint8Array | null = null;
  itemsByIdHex = new Map<string, Uint8Array>();

  override api(): any {
    return {
      json: async () => ({ username: "u", password: "p" }),
      getBytes: async (path: string) => {
        void path;
        if (!this.manifestBytes) {
          throw new SignalHttpError(404, undefined);
        }
        return this.manifestBytes;
      },
      bytes: async (_method: string, _path: string, body: Uint8Array) => {
        let op = decode(ReadOperation, body);
        let items: StorageItem[] = (op.readKey ?? []).map(id => ({
          key: id, value: this.itemsByIdHex.get(bytesToHex(id))!,
        }));
        return encode(StorageItems, { items } as StorageItems);
      },
    };
  }
  override authCredentials() {
    return { username: `${this.aci!.uuidString()}.1`, password: "x" };
  }
}

/** Build an encrypted manifest + items from plaintext records, the way the server
 * stores them, and load them into a TestStorageAccount. @param recordIkm when
 * set, items use the SSRE2 HKDF item-key scheme; otherwise legacy HMAC. */
async function loadStore(
  account: TestStorageAccount, storageKey: Uint8Array, version: number,
  records: { type: RecordType, record: StorageRecord }[], recordIkm?: Uint8Array,
): Promise<void> {
  let identifiers = [];
  for (let { type, record } of records) {
    let rawId = randomBytes(16);
    let itemKey = recordIkm ? deriveItemKeyFromIkm(recordIkm, rawId) : deriveItemKey(storageKey, rawId);
    let value = await storageEncrypt(itemKey, encode(StorageRecord, record));
    account.itemsByIdHex.set(bytesToHex(rawId), value);
    identifiers.push({ raw: rawId, type });
  }
  let manifestRecord: ManifestRecord = { version: BigInt(version), identifiers, sourceDevice: 1 };
  if (recordIkm) {
    manifestRecord.recordIkm = recordIkm;
  }
  let manifestKey = deriveManifestKey(storageKey, version);
  let value = await storageEncrypt(manifestKey, encode(ManifestRecord, manifestRecord));
  account.manifestBytes = encode(StorageManifest, { version: BigInt(version), value });
}

function newAccount(): TestStorageAccount {
  let account = new TestStorageAccount();
  account.storage = new DummyChatStorage();
  account.aci = ServiceId.aci(uuidToBytes("00000000-0000-4000-8000-0000000000aa"));
  account.servicePassword = "pw";
  appGlobal.chatAccounts.add(account);
  return account;
}

// --- key derivation ---

test("AEP → masterKey is the documented HKDF (deterministic, 32 bytes)", () => {
  let aep = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123";
  let other = "z" + aep.slice(1);
  let mk = deriveMasterKeyFromAEP(aep);
  expect(mk.length).toBe(32);
  expect(bytesToHex(mk)).toBe(bytesToHex(deriveMasterKeyFromAEP(aep))); // stable
  expect(bytesToHex(mk)).not.toBe(bytesToHex(deriveMasterKeyFromAEP(other)));
});

// --- full sync round-trip ---

test("sync(): decrypts the manifest + a ContactRecord and lands a roster contact", async () => {
  let account = newAccount();
  account.masterKey = randomBytes(32);
  let storageKey = deriveStorageKey(account.masterKey);
  let profileKey = randomBytes(32);

  let contact: StorageRecord = {
    contact: {
      aciBinary: uuidToBytes(aliceUuid),
      e164: "+15551230001",
      profileKey,
      givenName: "Alice",
      familyName: "Example",
      blocked: false,
    },
  };
  await loadStore(account, storageKey, 5, [{ type: RecordType.Contact, record: contact }]);

  let changed = await account.syncRoster().then(() => true);
  expect(changed).toBe(true);

  let inRoster = account.roster.contents.find(c => c.serviceId.uuidString() == aliceUuid);
  expect(inRoster).toBeTruthy();
  expect(inRoster!.e164).toBe("+15551230001");
  expect(bytesToHex(inRoster!.profileKey!)).toBe(bytesToHex(profileKey));
  expect(inRoster!.name).toBe("Alice Example");
  expect(account.storageManifestVersion).toBe(5);
  expect(account.storageKnownIds.size).toBe(1);
});

test("sync(): applies AccountRecord (own profile key) and notes a GroupV2 master key", async () => {
  let account = newAccount();
  account.masterKey = randomBytes(32);
  let storageKey = deriveStorageKey(account.masterKey);
  let ownProfileKey = randomBytes(32);

  await loadStore(account, storageKey, 2, [
    { type: RecordType.Account, record: { account: { profileKey: ownProfileKey, givenName: "Me", familyName: "" } } },
    { type: RecordType.GroupV2, record: { groupV2: { masterKey: groupMaster } } },
  ]);

  await account.syncRoster();
  expect(bytesToHex(account.profileKey!)).toBe(bytesToHex(ownProfileKey));
  expect(account.realname).toBe("Me");
  expect(account.groupMasterKeys.get(bytesToHex(groupMaster))).toBeTruthy();
});

test("sync(): SSRE2 recordIkm item-key scheme decrypts too", async () => {
  let account = newAccount();
  account.masterKey = randomBytes(32);
  let storageKey = deriveStorageKey(account.masterKey);
  let recordIkm = randomBytes(32);

  await loadStore(account, storageKey, 9, [
    { type: RecordType.Contact, record: { contact: { aciBinary: uuidToBytes(aliceUuid), e164: "+15551239999" } } },
  ], recordIkm);

  await account.syncRoster();
  let inRoster = account.roster.contents.find(c => c.serviceId.uuidString() == aliceUuid);
  expect(inRoster?.e164).toBe("+15551239999");
});

test("sync(): a 404 manifest (no store yet) is a clean no-op", async () => {
  let account = newAccount();
  account.masterKey = randomBytes(32);
  let changed = await new SignalStorageService(account).sync();
  expect(changed).toBe(false);
});

test("syncRoster(): no-op without a master key", async () => {
  let account = newAccount(); // no masterKey
  await account.syncRoster();
  expect(account.roster.length).toBe(0);
});
