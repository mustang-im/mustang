import { PublicKey, EncryptionSystem, TrustLevel } from "../PublicKey";
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

  publicKeyAsFile(): File {
    return this.keyAsFile(this.publicKeyArmored, "application/pgp-keys", "PublicKey", "asc");
  }

  /** Reads a PGP public key from an armored file.
   * Factory function. */
  static async importPublicKey(armoredPublicKey: string): Promise<PGPPublicKey> {
    const openPGP = await import("openpgp");
    let key = new PGPPublicKey();
    key.publicKeyArmored = armoredPublicKey;
    let pu = await openPGP.readKey({ armoredKey: armoredPublicKey });
    await key.readFromOpenPGPKey(pu);
    return key;
  }

  protected async readFromOpenPGPKey(pgp: OpenPGP.Key) {
    this.id = pgp.getKeyID().toHex().toUpperCase();
    this.fingerprint = pgp.getFingerprint();
    this.trustLevel = TrustLevel.Sender;
    this.created = pgp.getCreationTime();
    let expiry = await pgp.getExpirationTime();
    if (expiry instanceof Date) {
      this.expires = expiry;
    }
    let pgpCipher = pgp.getAlgorithmInfo();
    let cipher = pgpCipher.algorithm;
    if (pgpCipher.curve) {
      cipher += "/" + pgpCipher.curve;
    }
    this.cipher = cipher.replaceAll("Legacy", "").toUpperCase();
    this.keyLengthInBits = pgpCipher.bits;
    this.name = this.id.substring(0, 4).toUpperCase();
    for (let user of pgp.users) {
      this.userIDs.add(user.userID.email);
    }
  }
}
