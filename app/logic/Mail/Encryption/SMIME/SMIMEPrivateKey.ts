import { SMIMEPublicKey } from "./SMIMEPublicKey";
import type { PrivateKey } from "../PublicKey";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty } from "../../../util/Observable";

export class SMIMEPrivateKey extends SMIMEPublicKey implements PrivateKey {
  /**
   * Armored private S/MIME key
   * This is super secret and should never leak.
   */
  protected privateKeyArmored: string;

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
    return this.keyAsFile(this.privateKeyArmored, "application/pkcs8", "SecretKey", "p8");
  }

  toJSON() {
    let json = super.toJSON();
    json.privateKeyArmored = this.privateKeyArmored;
    json.useToSign = this.useToSign;
    json.didBackup = this.didBackup;
    return json;
  }
  fromJSON(json: any) {
    super.fromJSON(json);
    this.privateKeyArmored = sanitize.nonemptystring(json.privateKeyArmored, null);
    this.useToSign = sanitize.boolean(json.useToSign, null);
    this.didBackup = sanitize.boolean(json.didBackup, null);
  }
}
