import { PublicKey, EncryptionSystem } from "../PublicKey";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";

export class PGPPublicKey extends PublicKey {
  system = EncryptionSystem.PGP;
  /**
   * Armored (base64-encoded) public PGP key, i.e.
   * `-----BEGIN PGP PUBLIC KEY BLOCK-----` …
   * `-----END PGP PUBLIC KEY BLOCK-----`
   */
  publicKeyArmored: string;

  toJSON() {
    let json = super.toJSON();
    json.publicKeyArmored = this.publicKeyArmored;
    return json;
  }
  fromJSON(json: any) {
    super.fromJSON(json);
    this.publicKeyArmored = sanitize.nonemptystring(json.publicKeyArmored, null);
  }
}
