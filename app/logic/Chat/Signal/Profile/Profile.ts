/** Signal profiles (Docs/05 Part A). Fetch + decrypt another user's profile (name,
 * about, aboutEmoji, avatar) with their profile key, and write our own. Mirrors how
 * WhatsAppContact.fetch / the XMPP vCard fetch populate a contact in the background.
 *
 * Profile fields are AES-256-GCM under the 32-byte profile key, fixed-bucket padded
 * (ProfileCipher). The avatar is a CDN-0 object path, GET + decrypt with the same
 * profile-key GCM stream (nonce(12) ‖ ciphertext ‖ tag(16)). The zk *versioned*
 * write commitment (ProfileKeyCommitment / ExpiringProfileKeyCredential) is a
 * deferred groups concern — ⚠️ see setOwnProfile. */
import type { SignalAccount } from "../SignalAccount";
import type { SignalContact } from "../SignalContact";
import { ServiceId } from "../ServiceId";
import { SignalHosts } from "../Connection/SignalApi";
import {
  decryptProfileName,
  encryptProfileName, encryptProfileAbout, encryptProfileEmoji,
} from "../Encryption/ProfileCipher";
import { base64Encode, base64Decode, aesGCMDecrypt } from "../Crypto/primitives";
import { appGlobal } from "../../../app";
import { blobToDataURL } from "../../../util/util";

/** GET /v1/profile/{aci} (+versioned) response (Docs/05 §A.4). All field values are
 * base64; the encrypted ones are decrypted with the contact's profile key. */
interface ProfileResponse {
  identityKey?: string;
  name?: string | null;
  about?: string | null;
  aboutEmoji?: string | null;
  avatar?: string | null;
  unidentifiedAccess?: string | null;
  capabilities?: { [name: string]: boolean };
  uuid?: string;
}

export class SignalProfile {
  constructor(protected readonly account: SignalAccount) {}

  /** Fetch + decrypt a contact's profile and apply name + avatar to them, then to
   * the linked address-book person. Best-effort: logs and returns on any error
   * (no profile key yet, 404, network). */
  async fetchProfile(contact: SignalContact): Promise<void> {
    try {
      if (!contact.profileKey) {
        return; // can't decrypt without their profile key (learned from a message / storage)
      }
      let res = await this.getProfile(contact.serviceId, contact.profileKey);
      await this.applyProfile(contact, res, contact.profileKey);
    } catch (ex) {
      console.error("Signal: fetching profile failed:", ex);
    }
  }

  /** GET the **versioned** profile JSON (Docs/05 §A.4). Only the versioned response
   * carries the encrypted name/about/avatar; the version is derived from the
   * contact's profile key + ACI (no zk credential needed — that's a groups concern). */
  protected async getProfile(serviceId: ServiceId, profileKey: Uint8Array): Promise<ProfileResponse> {
    let version = await profileKeyVersion(profileKey, serviceId);
    return await this.account.api(SignalHosts.chat).json<ProfileResponse>(
      "GET", `/v1/profile/${serviceId.toString()}/${version}`, undefined, this.account.authCredentials());
  }

  /** Decrypt the name + avatar with `profileKey` and apply onto the contact. */
  protected async applyProfile(contact: SignalContact, res: ProfileResponse, profileKey: Uint8Array): Promise<void> {
    if (res.identityKey) {
      contact.identityKey = base64Decode(res.identityKey);
    }
    if (res.name) {
      let { givenName, familyName } = await decryptProfileName(profileKey, base64Decode(res.name));
      let name = [givenName, familyName].filter(Boolean).join(" ").trim();
      if (name) {
        contact.name = name;
      }
    }
    if (res.avatar) {
      let picture = await this.fetchAvatar(res.avatar, profileKey);
      if (picture) {
        contact.picture = picture;
      }
    }
    await this.applyToPerson(contact);
  }

  /** Download the avatar object from CDN 0 and decrypt it (profile-key GCM stream).
   * @returns a data: URL, or null on any failure. */
  async fetchAvatar(path: string, profileKey: Uint8Array): Promise<string | null> {
    try {
      let bytes = await this.account.api(SignalHosts.cdn0).getBytes("/" + path);
      let plaintext = await decryptAvatar(profileKey, bytes);
      return await blobToDataURL(new Blob([plaintext as BlobPart], { type: "image/jpeg" }));
    } catch (ex) {
      console.error("Signal: fetching profile avatar failed:", ex);
      return null;
    }
  }

  /** Copy the fetched name/avatar onto the linked address-book person (if any),
   * without clobbering data the user already set. */
  protected async applyToPerson(contact: SignalContact): Promise<void> {
    let person = contact.findPerson();
    if (!person) {
      return;
    }
    let changed = false;
    if (contact.name && person.name != contact.name && !person.name) {
      person.name = contact.name;
      changed = true;
    }
    if (contact.picture && !person.picture) {
      person.picture = contact.picture;
      changed = true;
    }
    if (changed) {
      await person.save();
    }
  }

  /** Write our own profile (PUT /v1/profile, Docs/05 §A.4). Encrypts name/about/
   * aboutEmoji under our profile key and sends the versioned-write JSON.
   * ⚠️ The zk `commitment` (ProfileKeyCommitment) and avatar S3 upload form are
   * deferred (ExpiringProfileKeyCredential, Docs/05 §A.2/§A.5); this writes the
   * encrypted fields + version. Returns the server response (avatar upload form on
   * an UPDATE, see TODO). */
  async setOwnProfile(profile: { givenName: string, familyName?: string, about?: string, aboutEmoji?: string }): Promise<any> {
    if (!this.account.profileKey || !this.account.aci) {
      throw new Error("Signal: no profile key / ACI to write a profile");
    }
    let profileKey = this.account.profileKey;
    let body: ProfileWriteJSON = {
      version: await profileKeyVersion(profileKey, this.account.aci),
      name: base64Encode(await encryptProfileName(profileKey, profile.givenName, profile.familyName ?? "")),
      avatar: false,
      sameAvatar: true,
      // ⚠️ commitment (97-byte ProfileKeyCommitment, Docs/05 §A.2) deferred.
    };
    if (profile.about != null) {
      body.about = base64Encode(await encryptProfileAbout(profileKey, profile.about));
    }
    if (profile.aboutEmoji != null) {
      body.aboutEmoji = base64Encode(await encryptProfileEmoji(profileKey, profile.aboutEmoji));
    }
    // UNKNOWN (live-confirm): whether the server requires the zk `commitment`
    // (ProfileKeyCommitment) on a field-only write. We omit it. If this 4xx's
    // (logged by SignalApi), the commitment is required → implement
    // ExpiringProfileKeyCredential/ProfileKeyCommitment (Docs/05 §A.2, TODO-crypto.md).
    console.log("Signal PUT /v1/profile — WITHOUT zk commitment; version", body.version,
      "| if this 4xx's, the server requires a ProfileKeyCommitment");
    let res = await this.account.api(SignalHosts.chat).json("PUT", "/v1/profile", body, this.account.authCredentials());
    console.log("Signal PUT /v1/profile: ACCEPTED — no commitment required for a field-only write");
    return res;
  }
}

/** Decrypt an avatar: nonce(12) ‖ GCM-ciphertext ‖ tag(16) under the profile key. */
export async function decryptAvatar(profileKey: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  let nonce = data.subarray(0, 12);
  return await aesGCMDecrypt(profileKey, nonce, data.subarray(12));
}

/** The 64-hex `ProfileKeyVersion` for the URL/write (Docs/05 §A.2): SHO over the
 * label, then `profileKey(32) ‖ aci_uuid(16)`. Uses the verified zkgroup `Sho`. */
export async function profileKeyVersion(profileKey: Uint8Array, aci: ServiceId): Promise<string> {
  let { Sho } = await import("../Encryption/ZKGroup/sho");
  let sho = new Sho("Signal_ZKGroup_20200424_ProfileKeyAndUid_ProfileKey_GetProfileKeyVersion");
  let combined = new Uint8Array(48);
  combined.set(profileKey.subarray(0, 32));
  combined.set(aci.uuid, 32);
  sho.absorbAndRatchet(combined);
  let raw = sho.squeezeAndRatchet(32);
  return [...raw].map(b => b.toString(16).padStart(2, "0")).join("");
}

/** PUT /v1/profile body (Docs/05 §A.4). */
interface ProfileWriteJSON {
  version: string;
  name: string;
  about?: string;
  aboutEmoji?: string;
  avatar: boolean;
  sameAvatar: boolean;
}
