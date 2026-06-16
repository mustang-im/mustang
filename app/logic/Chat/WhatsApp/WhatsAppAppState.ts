/** WhatsApp app-state sync — the channel that carries the user's saved contact
 * names (and settings like mute/pin) to a companion, separate from history sync.
 *
 * The primary device shares per-account master keys via an `AppStateSyncKeyShare`
 * (inside a `ProtocolMessage`); we then request each collection's snapshot +
 * patches over a `w:sync:app:state` IQ, decrypt the mutations, verify them
 * against an LTHash + MACs, and apply them. Contact names live in
 * `critical_unblock_low`.
 *
 * The key-share is sent only at link time, so the keys are persisted with the
 * account; on every login we re-request the (small) snapshot from scratch rather
 * than tracking incremental versions — simpler and robust. */
import type { WhatsAppAccount } from "./WhatsAppAccount";
import { kServerUser } from "./Binary/JID";
import { WANode } from "./Binary/WANode";
import { downloadMedia, type MediaDescriptor } from "./WhatsAppMedia";
import { MediaType } from "./Crypto/mediaCrypto";
import {
  expandAppStateKeys, valueMac, indexMac, decryptMutationValue, encContentOf, valueMacOf,
  WAPatchIntegrity, snapshotMac, patchMac, type AppStateKeys,
} from "./Crypto/appStateCrypto";
import { waLog } from "./util";
import { base64Encode, base64Decode, bytesEqual } from "../Signal/Crypto/primitives";
import { decode } from "../Signal/Proto/codec";
import {
  SyncdSnapshot, SyncdPatch, SyncdMutations, SyncActionData, SyncdOperation, ExternalBlobReference,
  type AppStateSyncKeyShare, type SyncdRecord,
} from "./Proto/schema";

/** Contact names live in this collection. */
const kContactsCollection = "critical_unblock_low";

/** A collection's running sync state, while applying one snapshot + its patches. */
interface CollectionState {
  version: number;
  hash: Uint8Array;                          // 128-byte LTHash accumulator
  valueMacByIndex: Map<string, Uint8Array>;  // base64(indexMAC) → valueMAC, for REMOVE/overwrite
}

/** One decrypted, verified record. */
interface DecodedRecord {
  indexMac: Uint8Array;
  valueMac: Uint8Array;
  data: SyncActionData;
}

export class WhatsAppAppState {
  /** App-state master keys the primary shared, by base64 key id. Persisted. */
  readonly keys = new Map<string, Uint8Array>();
  /** Expanded sub-keys, cached per key id (not persisted; cheap to re-derive). */
  private readonly expanded = new Map<string, AppStateKeys>();

  constructor(protected account: WhatsAppAccount) {
  }

  toJSON(): any {
    return { keys: [...this.keys.entries()].map(([id, key]) => ({ id, key: base64Encode(key) })) };
  }

  fromJSON(json: any): void {
    for (let entry of json?.keys ?? []) {
      this.keys.set(entry.id, base64Decode(entry.key));
    }
  }

  /** Stores the keys the primary shared (persisting them), then syncs. */
  storeKeys(share: AppStateSyncKeyShare): void {
    for (let key of share.keys ?? []) {
      let keyID = key.keyID?.keyID;
      let keyData = key.keyData?.keyData;
      if (keyID && keyData) {
        this.keys.set(base64Encode(keyID), keyData);
      }
    }
    this.account.scheduleSave(); // the key-share only comes at link time — keep it
    this.sync().catch(ex => this.account.errorCallback(ex));
  }

  /** Syncs the collections we care about (contacts → names). Safe to call on every
   * login; a no-op until we hold the keys. The fetch + download runs in the
   * background, so callers need not await it. */
  async sync(): Promise<void> {
    if (!this.keys.size) {
      return;
    }
    await this.syncCollection(kContactsCollection);
  }

  /** Requests a collection's snapshot + patches, then decrypts, verifies, and
   * applies them. A snapshot or patch that fails verification is skipped (logged),
   * leaving the rest applied. */
  protected async syncCollection(name: string): Promise<void> {
    if (!this.account.connection) {
      return;
    }
    let response = await this.account.connection.sendIQ(this.syncIQ(name));
    let collection = response.child("sync")?.child("collection");
    if (!collection) {
      return;
    }
    let state: CollectionState = { version: 0, hash: new Uint8Array(128), valueMacByIndex: new Map() };
    let applied = 0;
    let snapshot = collection.child("snapshot");
    if (snapshot?.content instanceof Uint8Array) {
      try {
        applied += await this.applySnapshot(decode(ExternalBlobReference, snapshot.content), state, name);
      } catch (ex) {
        console.error("WhatsApp app-state: snapshot rejected for", name + ":", (ex as any)?.message ?? ex);
      }
    }
    for (let patchNode of (collection.child("patches") ?? collection).children("patch")) {
      if (patchNode.content instanceof Uint8Array) {
        try {
          applied += await this.applyPatch(decode(SyncdPatch, patchNode.content), state, name);
        } catch (ex) {
          console.error("WhatsApp app-state: patch rejected for", name + ":", (ex as any)?.message ?? ex);
        }
      }
    }
    waLog("app-state:", name, "→ applied", applied, "name(s); version", state.version);
  }

  /** Downloads + decodes the snapshot blob, rebuilds the LTHash from its records,
   * verifies the snapshot MAC, and applies each record. @returns names applied. */
  private async applySnapshot(ref: ExternalBlobReference, state: CollectionState, name: string): Promise<number> {
    let snapshot = decode(SyncdSnapshot, await downloadMedia(this.account.connection, this.blobDescriptor(ref)));
    let macKeys = this.keysFor(snapshot.keyID?.id); // snapshot MAC uses the snapshot's key
    if (!macKeys) {
      return 0;
    }
    let adds: Uint8Array[] = [];
    let applied = 0;
    for (let record of snapshot.records ?? []) {
      let decoded = await this.decodeRecord(record, SyncdOperation.Set, snapshot.keyID?.id);
      adds.push(decoded.valueMac);
      state.valueMacByIndex.set(base64Encode(decoded.indexMac), decoded.valueMac);
      if (this.applyAction(decoded.data)) {
        applied++;
      }
    }
    state.hash = WAPatchIntegrity.subtractThenAdd(state.hash, [], adds);
    state.version = numberOf(snapshot.version?.version);
    this.verifyMac("snapshot " + name, snapshotMac(state.hash, state.version, name, macKeys.snapshotMac), snapshot.mac);
    return applied;
  }

  /** Applies one patch on top of `state`: decrypts its mutations, updates the
   * LTHash (add SET, subtract REMOVE/overwrite), and verifies both MACs. */
  private async applyPatch(patch: SyncdPatch, state: CollectionState, name: string): Promise<number> {
    let macKeys = this.keysFor(patch.keyID?.id); // patch + snapshot MACs use the patch's key
    if (!macKeys) {
      return 0;
    }
    let mutations = patch.mutations ?? [];
    if (patch.externalMutations?.directPath) {
      let blob = await downloadMedia(this.account.connection, this.blobDescriptor(patch.externalMutations));
      mutations = decode(SyncdMutations, blob).mutations ?? [];
    }
    let adds: Uint8Array[] = [];
    let subs: Uint8Array[] = [];
    let valueMacs: Uint8Array[] = [];
    let applied = 0;
    for (let mutation of mutations) {
      if (!mutation.record) {
        continue;
      }
      let operation = numberOf(mutation.operation);
      let decoded = await this.decodeRecord(mutation.record, operation, patch.keyID?.id);
      valueMacs.push(decoded.valueMac);
      let indexKey = base64Encode(decoded.indexMac);
      let previous = state.valueMacByIndex.get(indexKey);
      if (operation == SyncdOperation.Remove) {
        if (previous) {
          subs.push(previous);
          state.valueMacByIndex.delete(indexKey);
        }
      } else {
        if (previous) {
          subs.push(previous); // overwrite: drop the old contribution before adding the new
        }
        adds.push(decoded.valueMac);
        state.valueMacByIndex.set(indexKey, decoded.valueMac);
        if (this.applyAction(decoded.data)) {
          applied++;
        }
      }
    }
    state.hash = WAPatchIntegrity.subtractThenAdd(state.hash, subs, adds);
    state.version = numberOf(patch.version?.version);
    this.verifyMac("patch-snapshot " + name, snapshotMac(state.hash, state.version, name, macKeys.snapshotMac), patch.snapshotMAC);
    this.verifyMac("patch " + name, patchMac(patch.snapshotMAC!, valueMacs, state.version, name, macKeys.patchMac), patch.patchMAC);
    return applied;
  }

  /** Verifies a record's value MAC, decrypts it, and verifies the index MAC.
   * @throws on any MAC mismatch (the caller rejects the whole snapshot/patch). */
  private async decodeRecord(record: SyncdRecord, operation: number,
      containerKeyId: Uint8Array | undefined): Promise<DecodedRecord> {
    let valueBlob = record.value?.blob;
    let indexMacBytes = record.index?.blob;
    if (!valueBlob || !indexMacBytes) {
      throw new Error("app-state record missing value/index");
    }
    // The key is per-record (a patch may mix several), not the patch's key.
    let keyId = record.keyID?.id ?? containerKeyId;
    let keys = this.keysFor(keyId);
    if (!keys) {
      throw new Error("app-state record key unavailable");
    }
    let storedValueMac = valueMacOf(valueBlob);
    if (!bytesEqual(valueMac(operation, keyId!, encContentOf(valueBlob), keys.valueMac), storedValueMac)) {
      throw new Error("app-state value MAC mismatch");
    }
    let data = decode(SyncActionData, await decryptMutationValue(valueBlob, keys.valueEncryption));
    if (!data.index || !bytesEqual(indexMac(data.index, keys.index), indexMacBytes)) {
      throw new Error("app-state index MAC mismatch");
    }
    return { indexMac: indexMacBytes, valueMac: storedValueMac, data };
  }

  /** Applies one decoded action. Handles only contactAction (the names); other
   * action types (mute/pin/star/…) are ignored. @returns whether a name applied. */
  private applyAction(data: SyncActionData): boolean {
    let contactAction = data.value?.contactAction;
    if (!contactAction || !data.index) {
      return false;
    }
    let index: string[];
    try {
      index = JSON.parse(new TextDecoder().decode(data.index));
    } catch {
      return false;
    }
    if (index[0] != "contact" && index[0] != "lid_contact") {
      return false;
    }
    let displayName = contactAction.fullName || contactAction.firstName;
    this.account.rememberContactName(index[1], displayName);
    // Chats are LID-keyed, so apply the saved name to the LID identity too.
    if (contactAction.lidJid) {
      this.account.rememberContactName(contactAction.lidJid, displayName);
    }
    return true;
  }

  /** The expanded sub-keys for a key id, or null if we don't hold that master key. */
  private keysFor(keyId: Uint8Array | undefined): AppStateKeys | null {
    if (!keyId) {
      return null;
    }
    let id = base64Encode(keyId);
    let cached = this.expanded.get(id);
    if (cached) {
      return cached;
    }
    let master = this.keys.get(id);
    if (!master) {
      console.warn("WhatsApp app-state: no master key for id", id);
      return null;
    }
    let keys = expandAppStateKeys(master);
    this.expanded.set(id, keys);
    return keys;
  }

  private verifyMac(label: string, computed: Uint8Array, expected: Uint8Array | undefined): void {
    if (!expected || !bytesEqual(computed, expected)) {
      throw new Error(label + " MAC verification failed");
    }
  }

  private blobDescriptor(ref: ExternalBlobReference): MediaDescriptor {
    return {
      type: MediaType.AppState,
      directPath: ref.directPath ?? "",
      mediaKey: ref.mediaKey!,
      fileEncSHA256: ref.fileEncSHA256,
      fileSHA256: ref.fileSHA256,
    };
  }

  /** The `w:sync:app:state` request for one collection from version 0 (full snapshot). */
  protected syncIQ(name: string): WANode {
    return new WANode("iq", { to: kServerUser, type: "set", xmlns: "w:sync:app:state" }, [
      new WANode("sync", {}, [
        new WANode("collection", { name, version: "0", return_snapshot: "true" }),
      ]),
    ]);
  }
}

function numberOf(value: number | bigint | undefined): number {
  return Number(value ?? 0);
}
