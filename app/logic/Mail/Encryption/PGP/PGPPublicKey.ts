import { PublicKey, EncryptionSystem } from "../PublicKey";
import type OpenPGP from "openpgp";

export class PGPPublicKey extends PublicKey {
  system = EncryptionSystem.PGP;
  /**
   * Armored (base64-encoded) public PGP key, i.e.
   * `-----BEGIN PGP PUBLIC KEY BLOCK-----` …
   * `-----END PGP PUBLIC KEY BLOCK-----`
   */
  declare publicKeyArmored: string;
  pgpKey: OpenPGP.PublicKey | null = null;
}
