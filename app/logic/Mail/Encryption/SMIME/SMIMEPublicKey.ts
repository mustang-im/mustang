import { PublicKey, EncryptionSystem } from "../PublicKey";
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
   * Only set parseAllBytes to true if you know what you're doing.
   */
  async setCertificate(certificate: string, parseAllBytes = false) {
    let forge = await import("node-forge");
    let cert = forge.pki.certificateFromPem(certificate, true, { parseAllBytes });
    let id = cert.publicKey.n.toString(16);
    if (!this.id) {
      this.id = id;
      this.keyLengthInBits = id.length * 4;
    } else if (id != this.id) {
      throw new Error("Certificate does not match private key");
    }
    this.publicKeyArmored = forge.pki.certificateToPem(cert);
    this.name = cert.subject.getField("E").value;
    this.fingerprint = cert.md.digest().toHex();
    this.created = cert.validity.notBefore;
    this.expires = cert.validity.notAfter;
    let now = new Date();
    this.obsolete = now < this.created || now > this.expires;
  }

  async addCertificate(certificate: string) {
    let forge = await import("node-forge");
    let cert = forge.pki.certificateFromPem(certificate, false, { parseAllBytes: false });
    let id = cert.publicKey.n.toString(16);
    if (!this.id || this.id == id) {
      await this.setCertificate(certificate);
    } else {
      let key = this.chain.find(key => key.id == id);
      if (key) {
        await key.setCertificate(certificate);
      } else {
        this.chain.add(await SMIMEPublicKey.importPublicKey(certificate));
      }
    }
  }

  /** Reads an S/MIME certificate from a file.
   * maybeOpenSSL: True if this certificate might be an OpenSSL certificate
   * Factory function. */
  static async importPublicKey(publicKey: string, maybeOpenSSL = true): Promise<SMIMEPublicKey> {
    let key = new SMIMEPublicKey();
    await key.setCertificate(publicKey, !maybeOpenSSL);
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
