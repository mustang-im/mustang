import { SMIMEPublicKey } from "./SMIMEPublicKey";
import type { PrivateKey } from "../PrivateKey";
import { SMIMEReadProcessor } from "./SMIMEReadProcessor";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty } from "../../../util/Observable";

export class SMIMEPrivateKey extends SMIMEPublicKey implements PrivateKey {
  /**
   * Armored private S/MIME key
   * This is super secret and should never leak.
   */
  protected privateKeyArmored: string;
  passphrase: string;

  /** User wishes to sign all outgoing emails */
  @notifyChangedProperty
  useToSign = false;
  @notifyChangedProperty
  didBackup = false;
  justCreated = false;

  /** User wishes to send encrypted emails whenever possible */
  get encryptByDefault(): boolean {
    return this._encryptByDefault;
  }
  set encryptByDefault(val: boolean) {
    this._encryptByDefault = val;
    if (this._encryptByDefault) {
      this.useToSign = true;
    }
  }

  async decryptKey() {
    let forge = await import("node-forge");
    return forge.pki.decryptRsaPrivateKey(this.privateKeyArmored, this.passphrase);
  }

  privateKeyAsFile(): File {
    return this.keyAsFile(this.privateKeyArmored, "application/pkcs8", "SecretKey", "p8");
  }

  /**
   * Reads an S/MIME private key from a file.
   * Factory function.
   * @param passphrase
   *     Not yet supported.
   */
  static async importPrivateKey(privateKey: string, passphrase?: string): Promise<SMIMEPrivateKey> {
    let key = new SMIMEPrivateKey();
    key.privateKeyArmored = privateKey;
    key.passphrase = passphrase;
    let forge = await import("node-forge");
    let rsa = forge.pki.decryptRsaPrivateKey(privateKey, passphrase);
    key.id = rsa.n.toString(16);
    key.keyLengthInBits = key.id.length * 4;
    key.justCreated = true;
    return key;
  }

  toJSON() {
    let json = super.toJSON();
    json.privateKeyArmored = this.privateKeyArmored;
    json.useToSign = this.useToSign;
    json.didBackup = this.didBackup;
    json.passphrase = this.passphrase;
    return json;
  }
  fromJSON(json: any) {
    super.fromJSON(json);
    this.privateKeyArmored = sanitize.nonemptystring(json.privateKeyArmored, null);
    this.useToSign = sanitize.boolean(json.useToSign, null);
    this.didBackup = sanitize.boolean(json.didBackup, null);
    this.passphrase = sanitize.string(json.passphrase, null);
  }
}

SMIMEReadProcessor.hookup();
