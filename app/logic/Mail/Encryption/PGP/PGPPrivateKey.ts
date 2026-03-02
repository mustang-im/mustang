import { PGPPublicKey } from "./PGPPublicKey";
import { EncryptionSystem, type PrivateKey } from "../PublicKey";

export class PGPPrivateKey extends PGPPublicKey implements PrivateKey {
  system = EncryptionSystem.PGP;
  /**
   * Armored private PGP key, i.e.
   * `-----BEGIN PGP PRIVATE KEY BLOCK-----` …
   * `-----END PGP PRIVATE KEY BLOCK-----`
   */
  privateKeyArmored: string;
}
