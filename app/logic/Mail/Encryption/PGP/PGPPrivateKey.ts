import { PGPPublicKey } from "./PGPPublicKey";
import type { PrivateKey } from "../PublicKey";
import { notifyChangedProperty } from "../../../util/Observable";

export class PGPPrivateKey extends PGPPublicKey implements PrivateKey {
  /**
   * Armored private PGP key, i.e.
   * `-----BEGIN PGP PRIVATE KEY BLOCK-----` …
   * `-----END PGP PRIVATE KEY BLOCK-----`
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
