import { Observable, notifyChangedProperty } from "../../util/Observable";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ArrayColl } from "svelte-collections";

export class PublicKey extends Observable {
  @notifyChangedProperty
  name: string;
  id: string;
  fingerprint: string;
  /** Must be set by subclass */
  system: EncryptionSystem;
  created: Date;
  expires: Date;
  @notifyChangedProperty
  _trustLevel: TrustLevel;
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

  constructor() {
    super();
    this.trustLevel = TrustLevel.Sender;
    // Fake data
    this.id = "0x" + crypto.randomUUID().toUpperCase().replaceAll("-", "").substring(0, 16);
    this.fingerprint = crypto.randomUUID().toUpperCase().replaceAll("-", " ");
    this.name = this.id.substring(2, 6);
    this.caName = Math.random() > 0.5 ? "Verisign" : null;
    if (this.caName && this.trustLevel == TrustLevel.Sender) {
      this.trustLevel = TrustLevel.ThirdParty;
    }
    this.created = new Date();
    this.created.setDate(this.created.getDate() - Math.random() * 365 * 10);
    this.expires = new Date();
    this.expires.setFullYear(this.created.getFullYear() + Math.ceil(Math.random() * 20));
  }

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

  toJSON() {
    let json = {} as any;
    json.publicKeyArmored = this.publicKeyArmored;
    json.system = this.system;
    json.id = this.id;
    json.fingerprint = this.fingerprint;
    json.created = this.created.toISOString();
    json.expires = this.expires.toISOString();
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
    this.id = sanitize.alphanumdash(json.id);
    this.fingerprint = sanitize.alphanumdash(json.fingerprint);
    this.created = sanitize.date(json.created);
    this.expires = sanitize.date(json.expires);
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
}

/**
 * Values: For storage in JSON, and
 * for display to the user in the UI.
 */
export enum EncryptionSystem {
  PGP = "PGP",
  SMIME = "S/MIME",
  MLS = "MLS",
  Matrix = "Matrix",
  WhatsApp = "WhatsApp",
  Signal = "Signal",
  OMEMO = "XMPP-OMEMO",
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
