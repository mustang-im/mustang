import { PublicKey, EncryptionSystem } from "../PublicKey";
import { Certificate, RSAPublicKey, SubjectAlternativeName } from "./SMIMEASN1";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { ArrayColl } from "svelte-collections";

export class SMIMEPublicKey extends PublicKey {
  system = EncryptionSystem.SMIME;
  cipher = "RSA";
  /**
   * Armored (base64-encoded) public S/MIME certificate
   */
  declare publicKeyArmored: string;

  chain = new ArrayColl<SMIMEPublicKey>();

  constructor() {
    super();
    this.id = ""; // What is this field anyway?
    this.obsolete = true;
    this.fingerprint = "";
  }

  get certificate(): string {
    return this.publicKeyArmored;
  }

  /**
   * Parses the given certificate and sets it as the public key.
   */
  async setCertificate(certificate: string, label = "CERTIFICATE") {
    let cert = Certificate.decodePEM(certificate, { label });
    let rsa = RSAPublicKey.decode(cert.tbsCertificate.publicKey.subjectPublicKey.data) as RSAPublicKey;
    let id = rsa.n.toString(16);
    if (!this.id) {
      this.id = id;
      this.keyLengthInBits = id.length * 4;
    } else if (id != this.id) {
      throw new Error("Certificate does not match private key");
    }
    this.publicKeyArmored = Certificate.encodePEM(cert, { label: "CERTIFICATE" });
    try {
      let san = cert.tbsCertificate.extensions?.find(ext => ext.extnID == "subjectAlternativeName");
      this.name = SubjectAlternativeName.decode(san.extnValue)[0].value;
    } catch (ex) {
      let email = cert.tbsCertificate.subject.find(attr => attr.type == "E");
      if (email) {
        this.name = email.value.value;
      }
    }
    let hash = new Uint8Array(await window.crypto.subtle.digest("SHA-256", Certificate.encode(cert)));
    this.fingerprint = hash.toHex?.() ?? toHex(hash);
    let { notBefore, notAfter } = cert.tbsCertificate.validity;
    this.created = new Date(notBefore.value);
    this.expires = new Date(notAfter.value);
    let now = Date.now();
    this.obsolete = now < notBefore.value || now > notAfter.value;
  }

  async addCertificate(certificate: string) {
    let label = certificate.includes("-----BEGIN TRUSTED CERTIFICATE-----") ? "TRUSTED CERTIFICATE" : "CERTIFICATE";
    let cert = Certificate.decodePEM(certificate, { label });
    let rsa = RSAPublicKey.decode(cert.tbsCertificate.publicKey.subjectPublicKey.data) as RSAPublicKey;
    let id = rsa.n.toString(16);
    if (!this.id || this.id == id) {
      await this.setCertificate(certificate, label);
    } else {
      let key = this.chain.find(key => key.id == id);
      if (key) {
        await key.setCertificate(certificate, label);
      } else {
        this.chain.add(await SMIMEPublicKey.importPublicKey(certificate, label));
      }
    }
  }

  /** Reads an S/MIME certificate from a file.
   * maybeOpenSSL: True if this certificate might be an OpenSSL certificate
   * Factory function. */
  static async importPublicKey(publicKey: string, label?: string): Promise<SMIMEPublicKey> {
    let key = new SMIMEPublicKey();
    await key.setCertificate(publicKey, label);
    return key;
  }

  publicKeyAsFile(): File {
    return this.keyAsFile(this.publicKeyArmored, "application/pkix-cert", "PublicKey", "crt");
  }

  toJSON() {
    let json = super.toJSON();
    json.chain = this.chain.contents.map(key => key.toJSON());
    return json;
  }

  fromJSON(json: any) {
    super.fromJSON(json);
    for (let certificate of sanitize.array(json.chain, [])) {
      let key = new SMIMEPublicKey();
      key.fromJSON(certificate);
      this.chain.add(key);
    }
  }
}

function toHex(buf: Uint8Array):string {
  return Array.from(buf, n => n.toString(16).padStart(2, "0")).join("");
}

declare global {
  interface Uint8Array {
    toHex(): string;
  }
}
