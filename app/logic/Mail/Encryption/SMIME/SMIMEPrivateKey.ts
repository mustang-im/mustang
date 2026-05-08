import type { PrivateKey } from "../PrivateKey";
import { SMIMEPublicKey } from "./SMIMEPublicKey";
import { KeyDerivationAlgorithm, PrivateKeyInfo, EncryptedPrivateKeyInfo, PBES2Params, PBKDF2Params, RSAPrivateKey, RSAPublicKey, CertificationRequestInfo, DigestInfo, CertificationRequest, Null, OctetString } from "./SMIMEASN1";
import { decrypt, padFF } from "./SMIMERSAES";
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
      let cryptoKey = await this.decryptCryptoKey();
      privateKeyInfo = PrivateKeyInfo.decode(new Uint8Array(await crypto.subtle.exportKey("pkcs8", cryptoKey)));
    }
    if (privateKeyInfo.privateKeyAlgorithm.algorithm != "rsaEncryption") {
      throw new Error("Unsupported private key algorithm");
    }
    return RSAPrivateKey.decode(privateKeyInfo.privateKey);
  }

  async decryptCryptoKey(): Promise<CryptoKey> {
    if (!this.passphrase) {
      let privateKey = PrivateKeyInfo.decodePEM(this.privateKeyArmored, { label: "PRIVATE KEY" });
      if (privateKey.privateKeyAlgorithm.algorithm != "rsaEncryption") {
        throw new Error("Unsupported private key algorithm");
      }
      return crypto.subtle.importKey("pkcs8", PrivateKeyInfo.encode(privateKey),  { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, true, ["sign"]);
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
    let hash = sanitize.translate(pbkdf2.prf.algorithm, KeyDerivationAlgorithm);
    let rawKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(this.passphrase), "PBKDF2", false, ["deriveKey"]);
    let derivedKey = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: pbkdf2.salt.value, iterations: Number(pbkdf2.iterationCount), hash }, rawKey, { name: "AES-CBC", length }, false, ["unwrapKey"]);
    return crypto.subtle.unwrapKey("pkcs8", encryptedKey.encryptedData, derivedKey, { name: "AES-CBC", iv: OctetString.decode(pbes2.encryptionScheme.parameters) }, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, true, ["sign"]);
  }

  privateKeyAsFile(): File {
    return this.keyAsFile(this.privateKeyArmored, "application/pkcs8", "SecretKey", "key");
  }

  async generateCSRFile(subject: Record<string, string>): Promise<File> {
    let key = await this.decryptKey();
    let subjectSequence = [];
    for (let attr in attributeTypes) {
      if (subject[attr]) {
        subjectSequence.push({
          type: attr,
          value: {
            type: attributeTypes[attr],
            value: subject[attr],
          }
        });
      }
    }
    let info = {
      version: 0n,
      subject: subjectSequence,
      subjectPublicKeyInfo: {
        algorithmIdentifier: {
          algorithm: "rsaEncryption",
          parameters: Null.encode(),
        },
        subjectPublicKey: {
          unused: 0,
          data: RSAPublicKey.encode(key),
        },
      },
      attributes: [],
    };
    let digestInfo = {
      digestAlgorithm: {
        algorithm: "sha256",
        parameters: Null.encode(),
      },
      digest: new Uint8Array(await crypto.subtle.digest("SHA-256", CertificationRequestInfo.encode(info))),
    };
    let request = {
      certificationRequestInfo: info,
      signatureAlgorithm: {
        algorithm: "sha256WithRSAEncryption",
        parameters: Null.encode(),
      },
      signature: {
        unused: 0,
        data: decrypt(padFF(DigestInfo.encode(digestInfo), key), key),
      },
    };
    return this.keyAsFile(CertificationRequest.encodePEM(request, { label: "CERTIFICATE REQUEST" }), "application/pkcs10", "CertificateRequest", "csr");
  }

  /** Generates a new private key from scratch.
   * Factory function. */
  static async createNewPrivateKey(): Promise<SMIMEPrivateKey> {
    let passphrase = crypto.randomUUID();
    let salt = new Uint8Array(8);
    let iv = new Uint8Array(16);
    crypto.getRandomValues(salt);
    crypto.getRandomValues(iv);
    let rawKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    let derivedKey = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 2048, hash: "SHA-256" }, rawKey, { name: "AES-CBC", length: 256 }, false, ["wrapKey"]);
    let { privateKey } = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 4096, publicExponent: Uint8Array.of(1, 0, 1), hash: "SHA-256" }, true, ["sign"]);
    let wrappedKey = new Uint8Array(await crypto.subtle.wrapKey("pkcs8", privateKey, derivedKey, { name: "AES-CBC", iv }));
    let pbkdf2: PBKDF2Params = { salt: { type: "specified", value: salt }, iterationCount: 2048n, prf: { algorithm: "hmacWithSHA256", parameters: Null.encode() } };
    let pbes2 = { keyDerivationFunc: { algorithm: "pkcs5PBKDF2", parameters: PBKDF2Params.encode(pbkdf2) }, encryptionScheme: { algorithm: "aes256cbc", parameters: OctetString.encode(iv) } };
    let encryptedKey = { encryptionAlgorithm: { algorithm: "pkcs5PBES2", parameters: PBES2Params.encode(pbes2) }, encryptedData: wrappedKey };
    let privateKeyInfo = PrivateKeyInfo.decode(new Uint8Array(await crypto.subtle.exportKey("pkcs8", privateKey)));
    let rsaKey = RSAPrivateKey.decode(privateKeyInfo.privateKey);
    let key = new SMIMEPrivateKey();
    key.privateKeyArmored = EncryptedPrivateKeyInfo.encodePEM(encryptedKey, { label: "ENCRYPTED PRIVATE KEY" });
    key.passphrase = passphrase;
    key.id = rsaKey.n.toString(16);
    key.keyLengthInBits = 4096;
    key.justCreated = true;
    key.created = new Date();
    key.fingerprint = "--";
    return key;
  }

  /**
   * Reads an S/MIME private key from a file.
   * Factory function.
   */
  static async importPrivateKey(privateKey: string, passphrase?: string): Promise<SMIMEPrivateKey> {
    let parts = splitPEM(privateKey);
    let key = new SMIMEPrivateKey();
    key.privateKeyArmored = parts.shift();
    key.passphrase = passphrase;
    let rawKey = await key.decryptKey();
    assert(rawKey.n == rawKey.p * rawKey.q, "modulus should be product of primes");
    assert(rawKey.d * rawKey.e % (rawKey.p - 1n) == 1n, "prime exponents product should equal 1 modulo 1 less than prime 1");
    assert(rawKey.d * rawKey.e % (rawKey.q - 1n) == 1n, "prime exponents product should equal 1 modulo 1 less than prime 2");
    assert(rawKey.dP == rawKey.d % (rawKey.p - 1n), "prime 1 exponent does not match private exponent");
    assert(rawKey.dQ == rawKey.d % (rawKey.q - 1n), "prime 2 exponent does not match private exponent");
    assert(rawKey.qInv * rawKey.q % rawKey.p == 1n, "inverse does not match primes");
    key.id = rawKey.n.toString(16);
    key.keyLengthInBits = key.id.length * 4;
    key.justCreated = true;
    key.created = new Date();
    key.fingerprint = "--";
    for (let part of parts) {
      key.addCertificate(part);
    }
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

function splitPEM(key: string): string[] {
  let result: string[] = [];
  let label: string | null = null;
  let pem: string | null = null;
  for (let line of key.split(/[\r\n]+/)) {
    if (line.endsWith("-----")) {
      if (line.startsWith("-----BEGIN ")) {
        label = line.slice(11, -5);
        pem = line + "\n";
      } else if (line.startsWith("-----END ")) {
        if (label && line.slice(9, -5) == label) {
          result.push(pem + line);
        }
        label = null;
        pem = null;
      }
    } else if (pem) {
      pem += line + "\n";
    }
  }
  return result;
}

const attributeTypes: Record<string, "printstr" | "utf8str" | "ia5str"> = {
  C: "printstr", // country
  ST: "utf8str", // state
  L: "utf8str", // locality (city)
  O: "utf8str", // organisation
  OU: "utf8str", // organisational unit
  CN: "utf8str", // commonName
  E: "ia5str", // emailAddress
};

SMIMEReadProcessor.hookup();
