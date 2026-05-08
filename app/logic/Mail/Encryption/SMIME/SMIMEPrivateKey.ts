import type { PrivateKey } from "../PrivateKey";
import { SMIMEPublicKey } from "./SMIMEPublicKey";
import { PrivateKeyInfo, EncryptedPrivateKeyInfo, PBES2Params, PBKDF2Params, RSAPrivateKey, OctetString } from "./SMIMEASN1";
import { SMIMEReadProcessor } from "./SMIMEReadProcessor";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty } from "../../../util/Observable";
import { assert } from "../../../util/util";

export class SMIMEPrivateKey extends SMIMEPublicKey implements PrivateKey {
  /**
   * Armored private S/MIME key
   * This is super secret and should never leak.
   */
  protected privateKeyArmored: string;
  passphrase: string;

  /** User wishes to sign all outgoing emails */
  @notifyChangedProperty
  useToSign = false;
  @notifyChangedProperty
  didBackup = false;
  justCreated = false;

  /** User wishes to send encrypted emails whenever possible */
  get encryptByDefault(): boolean {
    return this._encryptByDefault;
  }
  set encryptByDefault(val: boolean) {
    this._encryptByDefault = val;
    if (this._encryptByDefault) {
      this.useToSign = true;
    }
  }

  async decryptKey(): Promise<RSAPrivateKey> {
    let privateKeyInfo;
    if (!this.passphrase) {
      privateKeyInfo = PrivateKeyInfo.decodePEM(this.privateKeyArmored, { label: "PRIVATE KEY" });
    } else {
      let cryptoKey = await this.decryptCryptoKey("SHA-256");
      privateKeyInfo = PrivateKeyInfo.decode(new Uint8Array(await crypto.subtle.exportKey("pkcs8", cryptoKey)));
    }
    if (privateKeyInfo.privateKeyAlgorithm.algorithm != "rsaEncryption") {
      throw new Error("Unsupported private key algorithm");
    }
    return RSAPrivateKey.decode(privateKeyInfo.privateKey);
  }

  async decryptCryptoKey(hash: "SHA-256" | "SHA-384" | "SHA-512"): Promise<CryptoKey> {
    if (!this.passphrase) {
      let privateKey = PrivateKeyInfo.decodePEM(this.privateKeyArmored, { label: "PRIVATE KEY" });
      if (privateKey.privateKeyAlgorithm.algorithm != "rsaEncryption") {
        throw new Error("Unsupported private key algorithm");
      }
      return crypto.subtle.importKey("pkcs8", PrivateKeyInfo.encode(privateKey),  { name: "RSASSA-PKCS1-v1_5", hash }, true, ["sign"]);
    }
    let encryptedKey = EncryptedPrivateKeyInfo.decodePEM(this.privateKeyArmored, { label: "ENCRYPTED PRIVATE KEY" });
    if (encryptedKey.encryptionAlgorithm.algorithm != "pkcs5PBES2") {
      throw new Error("Unsupported private key encryption algorithm");
    }
    let pbes2 = PBES2Params.decode(encryptedKey.encryptionAlgorithm.parameters);
    if (pbes2.keyDerivationFunc.algorithm != "pkcs5PBKDF2") {
      throw new Error("Unsupported private key derivation function");
    }
    let length = sanitize.translate(pbes2.encryptionScheme.algorithm, { aes128cbc: 128, aes192cbc: 192, aes256cbc: 256 });
    let pbkdf2 = PBKDF2Params.decode(pbes2.keyDerivationFunc.parameters);
    if (pbkdf2.salt.type != "specified") {
      throw new Error("Unsupported private key derivation salt");
    }
    let prfhash = sanitize.translate(pbkdf2.prf.algorithm, { hmacWithSHA1: "SHA-1", hmacWithSHA256: "SHA-256", hmacWithSHA384: "SHA-384", hmacWithSHA512: "SHA-512" });
    let rawKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(this.passphrase), "PBKDF2", false, ["deriveKey"]);
    let derivedKey = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: pbkdf2.salt.value, iterations: Number(pbkdf2.iterationCount), hash: prfhash }, rawKey, { name: "AES-CBC", length }, false, ["unwrapKey"]);
    return crypto.subtle.unwrapKey("pkcs8", encryptedKey.encryptedData, derivedKey, { name: "AES-CBC", iv: OctetString.decode(pbes2.encryptionScheme.parameters) }, { name: "RSASSA-PKCS1-v1_5", hash }, true, ["sign"]);
  }

  privateKeyAsFile(): File {
    return this.keyAsFile(this.privateKeyArmored, "application/pkcs8", "SecretKey", "p8");
  }

  /**
   * Reads an S/MIME private key from a file.
   * Factory function.
   */
  static async importPrivateKey(privateKey: string, passphrase?: string): Promise<SMIMEPrivateKey> {
    let key = new SMIMEPrivateKey();
    key.privateKeyArmored = privateKey;
    key.passphrase = passphrase;
    let rawKey = await key.decryptKey();
    assert(rawKey.n == rawKey.p ** rawKey.q, "modulus should be product of primes");
    assert(rawKey.d * rawKey.e % ((rawKey.p - 1n) * (rawKey.q - 1n)) == 1n, "prime exponents product should equal 1 modulo totient");
    assert(rawKey.dP == rawKey.d % (rawKey.p - 1n), "prime 1 exponent does not match private exponent");
    assert(rawKey.dQ == rawKey.d % (rawKey.q - 1n), "prime 2 exponent does not match private exponent");
    assert(rawKey.qInv * rawKey.q % rawKey.p == 1n, "inverse does not match primes");
    key.id = rawKey.n.toString(16);
    key.keyLengthInBits = key.id.length * 4;
    key.justCreated = true;
    return key;
  }

  toJSON() {
    let json = super.toJSON();
    json.privateKeyArmored = this.privateKeyArmored;
    json.useToSign = this.useToSign;
    json.didBackup = this.didBackup;
    json.passphrase = this.passphrase;
    return json;
  }
  fromJSON(json: any) {
    super.fromJSON(json);
    this.privateKeyArmored = sanitize.nonemptystring(json.privateKeyArmored, null);
    this.useToSign = sanitize.boolean(json.useToSign, null);
    this.didBackup = sanitize.boolean(json.didBackup, null);
    this.passphrase = sanitize.string(json.passphrase, null);
  }
}

SMIMEReadProcessor.hookup();
