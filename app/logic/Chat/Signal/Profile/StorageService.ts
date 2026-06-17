/** The Storage Service sync: pull the roster (contacts, groups, own account
 * record, settings) from Signal's storage service and apply it to the account.
 * See Docs/06.
 *
 * The chat server issues short-lived Basic-auth credentials for the separate
 * storage host (GET /v1/storage/auth). The manifest lists every record's 16-byte
 * id + type; we diff against what we last saw, fetch the changed items, decrypt
 * each (AES-256-GCM, key derived per the manifest's scheme), decode the
 * StorageRecord, and apply it. Read-only for the first cut — no WriteOperation
 * yet (⚠️ see end of file). Mirrors Mail's folder sync + the XMPP roster sync. */
import type { SignalAccount } from "../SignalAccount";
import { SignalContact } from "../SignalContact";
import { ServiceId, uuidToBytes } from "../ServiceId";
import { SignalHosts, SignalHttpError, type Credentials } from "../Connection/SignalApi";
import {
  deriveManifestKey, deriveItemKey, deriveItemKeyFromIkm, storageDecrypt,
} from "../Encryption/StorageCipher";
import {
  StorageManifest, StorageItems, ReadOperation, StorageRecord, ManifestRecord,
  type ManifestIdentifier, type ContactRecord, type GroupV2Record, type AccountRecord,
} from "../Proto/storage";
import { encode, decode } from "../Proto/codec";
import { bytesToHex } from "@noble/curves/utils.js";

/** GET /v1/storage/auth response (issued by the chat server, used on the storage host). */
interface StorageAuthResponse {
  username: string;
  password: string;
}

export class SignalStorageService {
  constructor(protected readonly account: SignalAccount) {}

  /** Pull the manifest, diff against what we last synced, fetch + apply the
   * changed records. A no-op (returns false) when already up to date. */
  /** @param forceReapply ignore the version/known-id diff cache: fetch the FULL
   * manifest and apply EVERY record. We don't persist the decrypted contact data
   * (display names, profile keys) across restarts, so a normal sync (manifest
   * unchanged → 204) would leave contacts showing their UUID. The startup roster
   * sync forces a re-apply so names/avatars are restored each run. */
  async sync(forceReapply = false): Promise<boolean> {
    let storageKey = this.account.storageKey;
    if (!storageKey) {
      throw new Error("Signal: no storage key — master key not yet sourced (Docs/06 §3)");
    }
    let creds = await this.storageCredentials();
    let manifest = await this.fetchManifest(creds, forceReapply ? 0 : this.account.storageManifestVersion);
    if (!manifest) {
      return false; // 204 same version, or 404 no manifest yet
    }
    let manifestRecord = await this.decryptManifest(storageKey, manifest);

    // Diff by 16-byte raw id: fetch ids we don't already know (all of them when forcing).
    let known = forceReapply ? new Set<string>() : this.account.storageKnownIds;
    let identifiers = manifestRecord.identifiers ?? [];
    let changed = identifiers.filter(id => id.raw && !known.has(bytesToHex(id.raw)));

    let recordIkm = manifestRecord.recordIkm?.length ? manifestRecord.recordIkm : null;
    for (let batch of chunk(changed, 1000)) {
      let items = await this.readItems(creds, batch.map(id => id.raw!));
      for (let item of items.items ?? []) {
        let identifier = batch.find(id => id.raw && bytesEqualBytes(id.raw, item.key!));
        await this.applyItem(storageKey, recordIkm, item.value!, identifier);
      }
    }

    // Record the new manifest version + the full id set so the next sync diffs cheaply.
    this.account.storageManifestVersion = Number(manifestRecord.version ?? 0n);
    this.account.storageKnownIds = new Set(identifiers.filter(id => id.raw).map(id => bytesToHex(id.raw!)));
    this.account.scheduleSave();
    return true;
  }

  /** GET /v1/storage/auth (chat host, authed) → Basic creds for the storage host. */
  async storageCredentials(): Promise<Credentials> {
    let res = await this.account.api(SignalHosts.chat).json<StorageAuthResponse>(
      "GET", "/v1/storage/auth", undefined, this.account.authCredentials());
    return { username: res.username, password: res.password };
  }

  /** GET the manifest, short-circuiting when our local version already matches.
   * @returns null on 204 (up to date) or 404 (no manifest yet). */
  protected async fetchManifest(creds: Credentials, localVersion: number): Promise<StorageManifest | null> {
    let path = localVersion > 0 ? `/v1/storage/manifest/version/${localVersion}` : "/v1/storage/manifest";
    try {
      let bytes = await this.account.api(SignalHosts.storage).getBytes(path, creds);
      if (!bytes?.length) {
        return null;
      }
      return decode(StorageManifest, bytes);
    } catch (ex) {
      if (ex instanceof SignalHttpError && (ex.status == 204 || ex.status == 404)) {
        return null;
      }
      throw ex;
    }
  }

  /** PUT /v1/storage/read → the requested StorageItems. */
  protected async readItems(creds: Credentials, ids: Uint8Array[]): Promise<StorageItems> {
    let body = encode(ReadOperation, { readKey: ids });
    let bytes = await this.account.api(SignalHosts.storage).bytes(
      "PUT", "/v1/storage/read", body, "application/x-protobuf", creds);
    return decode(StorageItems, bytes);
  }

  /** Decrypt the StorageManifest.value with the version-derived manifest key. */
  async decryptManifest(storageKey: Uint8Array, manifest: StorageManifest): Promise<ManifestRecord> {
    let manifestKey = deriveManifestKey(storageKey, manifest.version ?? 0n);
    let plaintext = await storageDecrypt(manifestKey, manifest.value!);
    return decode(ManifestRecord, plaintext);
  }

  /** Decrypt one StorageItem.value to a StorageRecord, selecting the item-key
   * scheme by whether the manifest carried a recordIkm (SSRE2 vs legacy). */
  async decryptItem(storageKey: Uint8Array, recordIkm: Uint8Array | null, rawId: Uint8Array, value: Uint8Array): Promise<StorageRecord> {
    let itemKey = recordIkm ? deriveItemKeyFromIkm(recordIkm, rawId) : deriveItemKey(storageKey, rawId);
    let plaintext = await storageDecrypt(itemKey, value);
    return decode(StorageRecord, plaintext);
  }

  /** Decrypt a fetched item and route the decoded record to the right applier. */
  protected async applyItem(storageKey: Uint8Array, recordIkm: Uint8Array | null, value: Uint8Array, identifier?: ManifestIdentifier): Promise<void> {
    if (!identifier?.raw) {
      return;
    }
    let record = await this.decryptItem(storageKey, recordIkm, identifier.raw, value);
    if (record.contact) {
      this.applyContact(record.contact);
    } else if (record.account) {
      this.applyAccount(record.account);
    } else if (record.groupV2) {
      this.applyGroupV2(record.groupV2);
    }
    // groupV1 / storyDistributionList / callLink are ignored for now.
  }

  /** A ContactRecord → a SignalContact in the roster (create or update). */
  applyContact(record: ContactRecord): void {
    let aci = record.aciBinary?.length ? record.aciBinary
      : record.aci ? uuidToBytes(record.aci) : null;
    if (!aci?.length) {
      return; // PNI-only contacts: we key the roster on ACI
    }
    let serviceId = ServiceId.aci(aci);
    let contact = this.account.getContact(serviceId);
    contact.pni = record.pniBinary?.length ? ServiceId.pni(record.pniBinary)
      : record.pni ? ServiceId.parse(record.pni) : contact.pni;
    contact.e164 = record.e164 || contact.e164;
    if (record.profileKey?.length) {
      contact.profileKey = record.profileKey;
    }
    if (record.identityKey?.length) {
      contact.identityKey = record.identityKey;
    }
    contact.blocked = !!record.blocked;
    let name = contactName(record);
    console.log(`Signal: storage contact ${serviceId.toString()} → saved name "${name ?? ""}", profileKey ${record.profileKey?.length ? "yes" : "no"}`);
    if (name) {
      contact.name = name;
    }
    if (!this.account.roster.includes(contact)) {
      this.account.roster.add(contact);
    }
  }

  /** Our own AccountRecord → our profile key + name. */
  applyAccount(record: AccountRecord): void {
    if (record.profileKey?.length) {
      this.account.profileKey = record.profileKey;
    }
    let name = [record.givenName, record.familyName].filter(Boolean).join(" ").trim();
    if (name) {
      this.account.realname = name;
    }
  }

  /** A GroupV2Record → note the group master key so its room can appear (Docs/04). */
  applyGroupV2(record: GroupV2Record): void {
    if (record.masterKey?.length) {
      this.account.noteGroupMasterKey(record.masterKey);
    }
  }
}

/** Build a display name from a ContactRecord, preferring the user-set nickname,
 * then the system name, then the Signal-profile name. */
function contactName(record: ContactRecord): string | undefined {
  let parts = (given?: string, family?: string) => [given, family].filter(Boolean).join(" ").trim() || undefined;
  return parts(record.nickname?.given, record.nickname?.family)
    ?? parts(record.systemGivenName, record.systemFamilyName)
    ?? parts(record.givenName, record.familyName);
}

function chunk<T>(arr: T[], size: number): T[][] {
  let out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function bytesEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length != b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }
  return true;
}
