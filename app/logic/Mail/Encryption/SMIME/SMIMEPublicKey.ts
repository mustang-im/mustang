import { PublicKey, EncryptionSystem } from "../PublicKey";

export class SMIMEPublicKey extends PublicKey {
  system = EncryptionSystem.SMIME;
  /**
   * Armored (base64-encoded) public S/MIME certificate
   */
  declare publicKeyArmored: string;

  publicKeyAsFile(): File {
    return this.keyAsFile(this.publicKeyArmored, "application/pkix-cert", "PublicKey", "crt");
  }
}
