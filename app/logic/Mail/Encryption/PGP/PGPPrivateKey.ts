import { PGPPublicKey } from "./PGPPublicKey";
import type { PrivateKey } from "../PublicKey";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty } from "../../../util/Observable";

export class PGPPrivateKey extends PGPPublicKey implements PrivateKey {
  /**
   * Armored private PGP key, i.e.
   * `-----BEGIN PGP PRIVATE KEY BLOCK-----` …
   * `-----END PGP PRIVATE KEY BLOCK-----`
   */
  privateKeyArmored: string;

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
