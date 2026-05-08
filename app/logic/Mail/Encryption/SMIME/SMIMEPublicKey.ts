import { PublicKey, EncryptionSystem, TrustLevel } from "../PublicKey";
import { DigestAlgorithm, SignatureAlgorithm, Certificate, RSAPublicKey, SubjectAlternativeName, RDNSequence, TBSCertificate, DigestInfo } from "./SMIMEASN1";
import { BlockType, unpadPKCS, decrypt, encrypt, Uint8ArrayToHex } from "./SMIMERSAES";
import { appGlobal } from "../../../app";
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
    this.obsolete = true;
  }

  get certificate(): string {
    return this.publicKeyArmored;
  }

  get commonName(): string {
    let cert = Certificate.decodePEM(this.publicKeyArmored, { label: "Certificate" });
    let cn = cert.tbsCertificate.subject.find(attr => attr.type == "CN");
    return cn?.value?.value ?? "";
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
    this.fingerprint = Uint8ArrayToHex(hash);
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

  async keyStatus(): Promise<KeyStatus> {
    if (!this.certificate) {
      return KeyStatus.NoCertificate;
    }
    let cert = Certificate.decodePEM(this.certificate, { label: "CERTIFICATE" });
    for (let key of this.chain) {
      if (key.obsolete) {
        console.log("obsolete certificate in chain");
        return KeyStatus.ChainInvalid;
      }
      let signer = Certificate.decodePEM(key.certificate, { label: "CERTIFICATE" });
      if (!await verifySignature(cert, signer)) {
        return KeyStatus.ChainInvalid;
      }
      cert = signer;
    }
    for (let type of ["bundled", "system", "extra"]) {
      for (let ca of await lazyGetCACertificates(type)) {
        if (await verifySignature(cert, ca)) {
          if (this.trustLevel == TrustLevel.Distrusted) {
            this.trustLevel = type == "bundled" ? TrustLevel.ThirdParty : type == "system" ? TrustLevel.OS : TrustLevel.Personal;
            let cn = ca.tbsCertificate.subject.find(attr => attr.type == "CN");
            this.caName = cn?.value?.value ?? null;
          }
          return KeyStatus.Valid;
        }
      }
    }
    if (await verifySignature(cert, cert)) {
      return KeyStatus.SelfSignedRoot;
    }
    return KeyStatus.ChainIncomplete;
  }

  /** Reads an S/MIME certificate from a file.
   * @param publicKey The certificate in PEM format
   * @param label The certificate type, default "CERTIFICATE",
   *              but can be "TRUSTED CERTIFICATE" for an OpenSSL certificate.
   * Factory function. */
  static async importPublicKey(publicKey: string, label?: string): Promise<SMIMEPublicKey> {
    let key = new SMIMEPublicKey();
    await key.setCertificate(publicKey, label);
    return key;
  }

  publicKeyAsFile(): File {
    return this.keyAsFile(this.publicKeyArmored, "application/x-pem-file", "PublicKey", "pem");
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

async function verifySignature(cert: Certificate, signer: Certificate): Promise<boolean> {
  try {
    if (indexedDB.cmp(RDNSequence.encode(cert.tbsCertificate.issuer), RDNSequence.encode(signer.tbsCertificate.subject))) {
      console.log("subject did not match issuer");
      return false;
    }
    let algorithm = sanitize.translate(cert.signatureAlgorithm.algorithm, SignatureAlgorithm);
    let signedCert = TBSCertificate.encode(cert.tbsCertificate);
    let signedDigest = new Uint8Array(await crypto.subtle.digest(algorithm, signedCert));
    let rsa = RSAPublicKey.decode(signer.tbsCertificate.publicKey.subjectPublicKey.data);
    let digestInfo = DigestInfo.decode(unpadPKCS(encrypt(cert.signatureValue.data, rsa), BlockType.Signed));
    if (sanitize.translate(digestInfo.digestAlgorithm.algorithm, DigestAlgorithm) != algorithm) {
      console.log("mismatched digest signature algorithm");
      return false;
    }
    if (indexedDB.cmp(digestInfo.digest, signedDigest)) {
      console.log("signature mismatch");
      return false;
    }
    return true;
  } catch (ex) {
    // Typically a decryption error, but the validation should fail anyway.
    console.error(ex);
    return false;
  }
}

let promiseGetCACertificates: Record<string, Promise<Certificate[]> | undefined> = {};
function lazyGetCACertificates(type: string): Promise<Certificate[]> {
  return promiseGetCACertificates[type] ??= getCACertificatesLazy(type);
}

async function getCACertificatesLazy(type): Promise<Certificate[]> {
  let certificates: Certificate[] = [];
  let rootCertificates: string[] = await appGlobal.remoteApp.getCACertificates(type);
  for (let cert of rootCertificates) {
    try {
      certificates.push(Certificate.decodePEM(cert, { label: "CERTIFICATE" }));
    } catch (ex) {
      console.log("Error decoding certificate", cert);
      console.error(ex);
    }
  }
  return certificates;
}

export enum KeyStatus {
  NoCertificate,
  ChainInvalid,
  ChainIncomplete,
  SelfSignedRoot,
  Valid,
}
