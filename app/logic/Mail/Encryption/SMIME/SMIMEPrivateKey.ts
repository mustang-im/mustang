import { SMIMEPublicKey } from "./SMIMEPublicKey";
import { EncryptionSystem, type PrivateKey } from "../PublicKey";

export class SMIMEPrivateKey extends SMIMEPublicKey implements PrivateKey {
  system = EncryptionSystem.PGP;
  /**
   * Armored private S/MIME key
   */
  privateKeyArmored: string;
}
