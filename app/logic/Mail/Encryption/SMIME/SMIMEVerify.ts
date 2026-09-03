import { DigestAlgorithm, SignatureAlgorithm, Attributes, SubjectPublicKeyInfo, RSAPublicKey, DigestInfo, OctetString, Oid, Time, type TBSCertificate } from "./SMIMEASN1";
import { BlockType, unpadPKCS, encrypt } from "./SMIMERSAES";
import { SMIMEPublicKey, verifyECDSA } from "./SMIMEPublicKey";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";

/**
 * Verifies the signature of a CMS SignedData over the given content.
 * Checks only the signature itself, not the certificate chain.
 * @param signedData decoded `SignedData`
 * @param content the signed bytes: the cleartext MIME part for
 *   `multipart/signed`, or the unwrapped eContent for opaque-signed messages
 * @param sent when the message says that it was sent, i.e. the `Date:`
 *   header. Compared with the signing time, and used in its stead, if the
 *   signature does not give one.
 * @returns the signer's public key,
 *   or null, if the signature does not verify
 */
export async function verifySignedData(signedData: any, content: Uint8Array, sent?: Date): Promise<SMIMEPublicKey | null> {
  let certificates = sanitize.array(signedData.content.certificates, []);
  let signerInfos = sanitize.array(signedData.content.signerInfos, []);
  if (!certificates.length || !signerInfos.length) {
    console.log("signed data has no certificate and/or signature");
    return null;
  }
  let signerInfo = signerInfos[0];
  let sid = signerInfo.sid?.value;
  // TODO Support `subjectKeyIdentifier`
  let cert = signerInfo.sid?.type == "issuerAndSerialNumber" && certificates.find(cert =>
    cert.tbsCertificate.serialNumber == sid.serialNumber &&
    sameName(sid.issuer, cert.tbsCertificate.issuer));
  if (!cert) {
    console.log("the certificate that signed the message was not sent with it");
    return null;
  }
  let publicKey = cert.tbsCertificate.publicKey;
  let isECDSA = publicKey.algorithmIdentifier.algorithm == "ecPublicKey";
  if (!isECDSA && publicKey.algorithmIdentifier.algorithm != "rsaEncryption") {
    console.log("certificate does not contain an RSA or ECDSA public key");
    return null;
  }
  let digestAlgorithm = sanitize.translate(signerInfo.digestAlgorithm.algorithm, DigestAlgorithm, null);
  if (!digestAlgorithm) {
    console.log("message was digested with an algorithm that we do not know");
    return null;
  }
  // RFC 5652 section 10.1.2: signers write rsaEncryption, but verifiers
  // should also accept e.g. sha256WithRSAEncryption, which some clients
  // write instead. Its hash must match the digest algorithm. RFC 5753
  // section 2 says the same for ECDSA, where Thunderbird and Apple Mail
  // write ecdsaWithSHA256 rather than the bare ecPublicKey.
  if (signerInfo.signatureAlgorithm.algorithm != (isECDSA ? "ecPublicKey" : "rsaEncryption") &&
      sanitize.translate(signerInfo.signatureAlgorithm.algorithm, SignatureAlgorithm, null) != digestAlgorithm) {
    console.log("signature algorithm does not match the certificate");
    return null;
  }
  let messageDigest = new Uint8Array(await crypto.subtle.digest(digestAlgorithm, content as BufferSource));
  // Without signed attributes, the signature covers the content directly.
  let signedContent = content;
  let signedAt = sent?.getTime();
  if (signerInfo.signedAttrs) {
    // RFC 5652 section 5.3: the attributes must say which content they cover,
    // so that a signature cannot be moved to another kind of content
    let contentTypeAttribute = signerInfo.signedAttrs.find(attr => attr.attrType == "contentType");
    if (!contentTypeAttribute ||
        String(Oid.decode(contentTypeAttribute.attrValue[0])) != String(signedData.content.contentInfo.contentType)) {
      console.log("signature was made for another content type");
      return null;
    }
    let digestAttribute = signerInfo.signedAttrs.find(attr => attr.attrType == "messageDigest");
    if (!digestAttribute) {
      console.log("signature did not contain a message digest");
      return null;
    }
    if (indexedDB.cmp(OctetString.decode(digestAttribute.attrValue[0]), messageDigest)) {
      console.log("signed digest did not match message");
      return null;
    }
    let signingTimeAttribute = signerInfo.signedAttrs.find(attr => attr.attrType == "signingTime");
    if (signingTimeAttribute) {
      const k1HourMS = 60 * 60 * 1000;
      signedAt = Time.decode(signingTimeAttribute.attrValue[0]).value;
      if (sent && Math.abs(signedAt - sent.getTime()) > k1HourMS) {
        console.log("message was signed at a different time than it was sent");
        return null;
      }
    }
    signedContent = Attributes.encode(signerInfo.signedAttrs);
  }
  // The certificate must have been valid when the message was signed. Mail
  // that was signed before the certificate expired stays signed afterwards.
  let { notBefore, notAfter } = cert.tbsCertificate.validity;
  if (signedAt && (signedAt < notBefore.value || signedAt > notAfter.value)) {
    console.log("the certificate was not valid when the message was signed");
    return null;
  }
  /* `await crypto.subtle.verify()` returns `false` on
   * correctly signed messages...
  let key = await crypto.subtle.importKey("spki", SubjectPublicKeyInfo.encode(publicKey), { name: "RSASSA-PKCS1-v1_5", hash: digestAlgorithm }, false, ["verify"]);
  if (await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signerInfo.encryptedDigest, signedDigest)) {
    let rsa = RSAPublicKey.decode(publicKey.subjectPublicKey.data);
    return rsa.n.toString(16);
  }
  */
  if (isECDSA) {
    if (!await verifyECDSA(publicKey, signerInfo.signature, digestAlgorithm, signedContent)) {
      console.log("signature did not match the signed content");
      return null;
    }
  } else {
    let signedDigest = new Uint8Array(await crypto.subtle.digest(digestAlgorithm, signedContent));
    let rsa = RSAPublicKey.decode(publicKey.subjectPublicKey.data);
    let digestInfo = DigestInfo.decode(unpadPKCS(encrypt(signerInfo.signature, rsa), BlockType.Signed));
    if (digestInfo.digestAlgorithm.algorithm != signerInfo.digestAlgorithm.algorithm) {
      console.log("signature algorithm mismatch");
      return null;
    }
    if (indexedDB.cmp(digestInfo.digest, signedDigest)) {
      console.log("signature did not match the signed digest");
      return null;
    }
  }
  let signer = new SMIMEPublicKey();
  while (cert && await signer.addCertificate(cert)) {
    cert = certificates.find(chain =>
      sameName(chain.tbsCertificate.subject, cert.tbsCertificate.issuer));
  };
  // Update the signer's trustLevel if possible. The signature is already
  // proven here, so a failure to reach the CA certificates - they are not
  // available on all platforms - must not discard it. The trustLevel then
  // stays `Sender`, which is what an unknown CA gives us anyway.
  try {
    await signer.keyStatus();
  } catch (ex) {
    console.error(ex);
  }
  return signer;
}

/** Compares two X.501 names, e.g. certificate issuer and subject */
export function sameName(a: TBSCertificate["issuer"], b: TBSCertificate["issuer"]): boolean {
  return a.length == b.length &&
    // Attribute types that our OID map does not know, e.g. the eIDAS
    // organizationIdentifier, decode to arrays, which `==` compares by identity
    a.every((attr, i) => String(attr.type) == String(b[i].type) && attr.value.value == b[i].value.value);
}
