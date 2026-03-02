import { PublicKey, EncryptionSystem } from "../PublicKey";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";

export class SMIMEPublicKey extends PublicKey {
  system = EncryptionSystem.SMIME;
  /**
   * Armored (base64-encoded) public S/MIME certificate
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
