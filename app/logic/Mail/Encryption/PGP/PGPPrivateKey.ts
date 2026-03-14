import { PGPPublicKey, type OpenPGPModule } from "./PGPPublicKey";
import type { PrivateKey } from "../PublicKey";
import { PGPReadProcessor } from "./PGPReadProcessor";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty } from "../../../util/Observable";
import { assert } from "../../../util/util";
import type OpenPGP from "openpgp";

export class PGPPrivateKey extends PGPPublicKey implements PrivateKey {
  /**
   * Armored private PGP key, i.e.
   * `-----BEGIN PGP PRIVATE KEY BLOCK-----` …
   * `-----END PGP PRIVATE KEY BLOCK-----`
   * This is super secret and should never leak.
   */
  protected privateKeyArmored: string;
  protected passphrase: string;
  //revocationCertificate: string;
  protected _openPGPPrivateKey: OpenPGP.PrivateKey | null = null; // cache only

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

  async openPGPPrivateKey(openPGP?: OpenPGPModule): Promise<OpenPGP.PrivateKey> {
    if (this._openPGPPrivateKey) {
      return this._openPGPPrivateKey;
    }
    openPGP ??= await import("openpgp");
    assert(this.privateKeyArmored, `Have no private key stored for ${this.userIDs.first} ${this.name}`);
    let encryptedKey = await openPGP.readPrivateKey({ armoredKey: this.privateKeyArmored });
    let password = this.passphrase; // TODO
    return await openPGP.decryptKey({ privateKey: encryptedKey, passphrase: password });
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
    key.passphrase = passphrase;
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
    json.passphrase = this.passphrase;
    //json.revocationCertificate = this.revocationCertificate;
    json.useToSign = this.useToSign;
    json.didBackup = this.didBackup;
    return json;
  }
  fromJSON(json: any) {
    super.fromJSON(json);
    this.privateKeyArmored = sanitize.nonemptystring(json.privateKeyArmored, null);
    this.passphrase = sanitize.nonemptystring(json.passphrase, null);
    //this.revocationCertificate = sanitize.nonemptystring(json.revocationCertificate, null);
    this.useToSign = sanitize.boolean(json.useToSign, null);
    this.didBackup = sanitize.boolean(json.didBackup, null);
  }
}

PGPReadProcessor.hookup();
