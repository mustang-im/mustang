import { SMIMEPublicKey } from "./SMIMEPublicKey";
import type { type PrivateKey } from "../PublicKey";
import { notifyChangedProperty } from "../../../util/Observable";

export class SMIMEPrivateKey extends SMIMEPublicKey implements PrivateKey {
  /**
   * Armored private S/MIME key
   */
  privateKeyArmored: string;

  @notifyChangedProperty
  useToSign = true;

  get useToEncrypt(): boolean {
    return this._useToEncrypt;
  }
  set useToEncrypt(val: boolean) {
    this._useToEncrypt = val;
    if (this._useToEncrypt) {
      this.useToSign = true;
    }
  }
}
