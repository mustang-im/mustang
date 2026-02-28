import { Observable, notifyChangedProperty } from "../../util/Observable";
import { ArrayColl } from "svelte-collections";

export class PublicKey extends Observable {
  @notifyChangedProperty
  name: string;
  readonly id: string;
  readonly fingerprint: string;
  readonly system: EncryptionSystem;
  readonly created: Date;
  readonly expires: Date;
  @notifyChangedProperty
  _trustLevel: TrustLevel;
  @notifyChangedProperty
  useToEncrypt = false;
  /** expired, disabled by our user, revoked by owner etc. */
  @notifyChangedProperty
  obsolete = false;
  @notifyChangedProperty
  caName: string | null;
  readonly userIDs = new ArrayColl<string>;

  constructor(system: EncryptionSystem) {
    super();
    this.system = system;
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
