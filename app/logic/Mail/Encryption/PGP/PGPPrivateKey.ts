import { PGPPublicKey } from "./PGPPublicKey";
import { TrustLevel, type PrivateKey } from "../PublicKey";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty } from "../../../util/Observable";

export class PGPPrivateKey extends PGPPublicKey implements PrivateKey {
  /**
   * Armored private PGP key, i.e.
   * `-----BEGIN PGP PRIVATE KEY BLOCK-----` …
   * `-----END PGP PRIVATE KEY BLOCK-----`
   */
  privateKeyArmored: string;
  //revocationCertificate: string;

  @notifyChangedProperty
  useToSign = false;
  @notifyChangedProperty
  didBackup = false;
  justCreated = false;

  get useToEncrypt(): boolean {
    return this._useToEncrypt;
  }
  set useToEncrypt(val: boolean) {
    this._useToEncrypt = val;
    if (this._useToEncrypt) {
      this.useToSign = true;
    }
  }

  privateKeyAsFile(): File {
    return this.keyAsFile(this.privateKeyArmored, "application/pgp-secret-keys", "SecretKey", "asc");
  }

  /** Generates a new private key from scratch.
   * Factory function. */
  static async createNewPrivateKey(options: {
    realname: string,
    emailAddress: string,
  }): Promise<PGPPrivateKey> {
    const openPGP = await import("openpgp");
    let passphrase = crypto.randomUUID();
    const durationInSeconds = 3600 * 24 * 365 * 20; // 20 years
    let expiry = new Date();
    expiry.setDate(expiry.getDate() + 365 * 20);
    let { privateKey, publicKey, revocationCertificate } = await openPGP.generateKey({
      userIDs: [{
        name: options.realname,
        email: options.emailAddress,
      }],
      passphrase: passphrase, // protects the private key
      keyExpirationTime: durationInSeconds,
      format: "armored",
      type: "ecc",
      curve: "curve25519Legacy",
    });
    let key = await PGPPrivateKey.importPrivateKey(privateKey, passphrase);
    key.publicKeyArmored = publicKey;
    //key.revocationCertificate = revocationCertificate;
    return key;
  }

  /**
   * Reads a PGP private key from an armored file.
   * Factory function.
   * @param passphrase
   *     If passphrase is given, it decrypts it.
   *     If no passphrase is passed, it assumes that the file is not encrypted. */
  static async importPrivateKey(armoredPrivateKey: string, passphrase?: string): Promise<PGPPrivateKey> {
    const openPGP = await import("openpgp");
    let key = new PGPPrivateKey();
    key.privateKeyArmored = armoredPrivateKey;
    let pr = await openPGP.readPrivateKey({ armoredKey: armoredPrivateKey });
    if (passphrase) {
      pr = await openPGP.decryptKey({ privateKey: pr, passphrase: passphrase });
    }
    await key.readFromOpenPGPKey(pr);
    key.justCreated = true;
    return key;
  }

  toJSON() {
    let json = super.toJSON();
    json.privateKeyArmored = this.privateKeyArmored;
    //json.revocationCertificate = this.revocationCertificate;
    json.useToSign = this.useToSign;
    json.didBackup = this.didBackup;
    return json;
  }
  fromJSON(json: any) {
    super.fromJSON(json);
    this.privateKeyArmored = sanitize.nonemptystring(json.privateKeyArmored, null);
    //this.revocationCertificate = sanitize.nonemptystring(json.revocationCertificate, null);
    this.useToSign = sanitize.boolean(json.useToSign, null);
    this.didBackup = sanitize.boolean(json.didBackup, null);
  }
}
