import { Observable, notifyChangedProperty } from "../../util/Observable";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { AbstractFunction } from "../../util/util";
import { ArrayColl } from "svelte-collections";

export class PublicKey extends Observable {
  @notifyChangedProperty
  name: string;
  id: string;
  fingerprint: string;
  /** Must be set by subclass */
  system: EncryptionSystem;
  created: Date;
  /** null = never or unknown */
  expires: Date | null;
  cipher: string;
  keyLengthInBits: number | null = null;
  @notifyChangedProperty
  _trustLevel: TrustLevel = TrustLevel.Sender;
  @notifyChangedProperty
  _useToEncrypt = false;
  /** expired, disabled by our user, revoked by owner etc. */
  @notifyChangedProperty
  _obsolete = false;
  @notifyChangedProperty
  caName: string | null;
  readonly userIDs = new ArrayColl<string>;
  /**
   * Armored (base64-encoded) public PGP key for storage.
   * null, if this is a private key, or the system doesn't support armored string keys.
   */
  publicKeyArmored: string | null;

  get trustLevel(): TrustLevel {
    return this._trustLevel;
  }
  set trustLevel(val: TrustLevel) {
    if (val != TrustLevel.Distrusted &&
        this.trustLevel == TrustLevel.Distrusted) {
      this.obsolete = false;
    }
    this._trustLevel = val;
    if (this.trustLevel == TrustLevel.Distrusted) {
      this.obsolete = true;
      this.useToEncrypt = false;
    }
  }

  get useToEncrypt(): boolean {
    return this._useToEncrypt;
  }
  set useToEncrypt(val: boolean) {
    this._useToEncrypt = val;
  }

  get obsolete(): boolean {
    return this._obsolete;
  }
  set obsolete(val: boolean) {
    this._obsolete = val;
    if (this._obsolete) {
      this.useToEncrypt = false;
    }
  }

  /** Formats fingerprint as batches of 4 uppercase chars, separated by spaces.
   * Replace the space at position 25 with a newline. */
  get fingerprintDisplay(): string {
    const batchLength = 4;
    let batches: string[] = [];
    let fingerprint = this.fingerprint.toUpperCase();
    for (let i = 0; i < fingerprint.length; i += batchLength) {
      batches.push(fingerprint.substring(i, i + batchLength));
    }
    return batches.join(" ");
  }

  publicKeyAsFile(): File {
    // Implement using this.keyAsFile()
    throw new AbstractFunction();
  }
  protected keyAsFile(armored: string, mimetype: string, filenamePrefix: string, fileExt: string): File {
    let filename = filenamePrefix + "-" + this.userIDs.first + "-" + this.name + "." + fileExt;
    return new File([armored], filename, { type: mimetype });
  }

  get sortOrder(): number {
    return -(
      sanitize.translate(this.system, { [EncryptionSystem.PGP]: 2, [EncryptionSystem.SMIME]: 1 }, 0) +
      (this.useToEncrypt ? 20 : (this as any as PrivateKey).useToSign ? 10 : 0) +
      (this.obsolete ? -100 : 0));
  }

  toJSON() {
    let json = {} as any;
    json.publicKeyArmored = this.publicKeyArmored;
    json.system = this.system;
    json.name = this.name;
    json.id = this.id;
    json.fingerprint = this.fingerprint;
    json.created = this.created.toISOString();
    json.expires = this.expires?.toISOString();
    json.cipher = this.cipher;
    json.keyLengthInBits = this.keyLengthInBits;
    json.fingerprint = this.fingerprint;
    json.trustLevel = this.trustLevel;
    json.caName = this.caName;
    json.userIDs = this.userIDs.contents;
    json.useToEncrypt = this.useToEncrypt;
    json.obsolete = this.obsolete;
    return json;
  }
  fromJSON(json: any) {
    this.publicKeyArmored = sanitize.nonemptystring(json.publicKeyArmored, null);
    this.system = sanitize.enum<EncryptionSystem>(json.system, Object.values(EncryptionSystem));
    this.name = sanitize.label(json.name);
    this.id = sanitize.alphanumdash(json.id);
    this.fingerprint = sanitize.alphanumdash(json.fingerprint);
    this.created = sanitize.date(json.created);
    this.expires = sanitize.date(json.expires, null);
    this.cipher = sanitize.nonemptylabel(json.cipher, null);
    this.keyLengthInBits = sanitize.integer(json.keyLengthInBits, null);
    this.trustLevel = sanitize.enum<TrustLevel>(json.trustLevel, Object.values(TrustLevel), TrustLevel.Sender);
    this.caName = sanitize.nonemptystring(json.caName, null);
    this.userIDs.replaceAll(sanitize.array(json.userIDs).map(userID => sanitize.nonemptystring(userID)));
    this.useToEncrypt = sanitize.boolean(json.useToEncrypt, false);
    this.obsolete = sanitize.boolean(json.obsolete, false);
  }
}

/** Added to `PublicKey` */
export interface PrivateKey {
  /** Armored (base64-encoded) private key
   * This is super secret and should never leak. */
  privateKeyArmored: string;
  useToSign: boolean;
  didBackup: boolean;
  /** Set when the key is created.
   * Do not save this property. It should be false on load. */
  justCreated: boolean;

  privateKeyAsFile(): File;
}

/**
 * Values: For storage in JSON, and
 * for display to the user in the UI.
 */
export enum EncryptionSystem {
  PGP = "OpenPGP",
  SMIME = "S/MIME",
  MLS = "MLS",
  Matrix = "Matrix",
  WhatsApp = "WhatsApp",
  Signal = "Signal",
  OMEMO = "XMPP/OMEMO",
}

export enum TrustLevel {
  /** User validated the certificate personally. Full trust. */
  Personal = "personal",
  /** A trusted third party has confirmed this certificate.
   * E.g. S/MIME CAs, my company, PGP key servers
   */
  ThirdParty = "third-party",
  /** A person that we talk with has sent us this certificate via
   * untrusted channels. */
  Sender = "sender",
  /** Revoked by owner, or disabled by our user */
  Distrusted = "distrust",
}

export const trustColor = {
  [TrustLevel.Personal]: "green",
  [TrustLevel.ThirdParty]: "blue",
  [TrustLevel.Sender]: "yellow",
  [TrustLevel.Distrusted]: "red",
}

export const trustColorFG = {
  [TrustLevel.Personal]: "white",
  [TrustLevel.ThirdParty]: "white",
  [TrustLevel.Sender]: "black",
  [TrustLevel.Distrusted]: "white",
}
