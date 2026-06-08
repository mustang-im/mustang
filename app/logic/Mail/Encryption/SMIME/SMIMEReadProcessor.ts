import { EMailProcessor, ProcessingStartOn } from "../../EMailProcessor";
import type { EMail } from "../../EMail";
import { MailIdentity } from "../../MailIdentity";
import { SMIMEPrivateKey } from "./SMIMEPrivateKey";
import { DigestAlgorithm, EnvelopedData, Certificate, OctetString, SignedData, Attributes, SubjectPublicKeyInfo, RSAPublicKey, DigestInfo } from "./SMIMEASN1";
import { BlockType, unpadPKCS, decrypt, encrypt } from "./SMIMERSAES";
import { parseMIMEDirectSubparts } from "../MIME";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../../util/util";
import { ArrayColl } from "svelte-collections";
import type { Email as PostalEmail } from "postal-mime";

export class SMIMEReadProcessor extends EMailProcessor {
  runOn = ProcessingStartOn.Parse;
  async process(email: EMail, postal: PostalEmail) {
    // There is a direct accessor to the content type in the PostalMIME object
    // itself, but we don't have that here. And to get the headers in the
    // EMail object requires an extra parse, which seems wasteful. So
    // let's fish the header out of the PostalEmail object...
    let contentTypeHeader = postal.headers.find(header => header.key == "content-type")?.value ?? "";
    let contentType = contentTypeHeader.split(";")[0].trim().toLowerCase();
    if (contentType == "application/pkcs7-mime") {
      // Encrypted messages only have a body part but fsr this is an attachment.
      let encrypted = email.attachments.first;
      let envelopedData = EnvelopedData.decode(new Uint8Array(await encrypted.content.arrayBuffer()));
      if (!["aes128cbc", "aes192cbc", "aes256cbc"].includes(envelopedData.content.encryptedContentInfo.contentEncryptionAlgorithm.algorithm)) {
        return;
      }
      let vector = OctetString.decode(envelopedData.content.encryptedContentInfo.contentEncryptionAlgorithm.parameters);
      let encryptedContent = envelopedData.content.encryptedContentInfo.encryptedContent;
      // XXX what if you were BCC'd?
      for (let recipient of email.allRecipients()) {
        let identity = MailIdentity.findIdentity(new ArrayColl([recipient]), email.folder?.account)?.identity;
        if (identity) {
          for (let privateKey of identity.encryptionPrivateKeys) {
            if (privateKey instanceof SMIMEPrivateKey) {
              let cert = Certificate.decodePEM(privateKey.certificate, { label: "CERTIFICATE" });
              let subject = cert.tbsCertificate.subject;
              for (let recipientInfo of envelopedData.content.recipientInfos) {
                if (recipientInfo.type != "ktri" ||
                    recipientInfo.value.keyEncryptionAlgorithm.algorithm != "rsaEncryption" ||
                    recipientInfo.value.rid.type != "issuerAndSerialNumber") {
                  // TODO Support subjectKeyIdentifier
                  continue;
                }
                let rid = recipientInfo.value.rid.value;
                if (rid.serialNumber != cert.tbsCertificate.serialNumber ||
                    rid.issuer.length != subject.length) {
                  continue;
                }
                if (!rid.issuer.every((attr, i) => attr.type == subject[i].type && attr.value.value == subject[i].value.value)) {
                  continue;
                }
                let rawKey = await privateKey.decryptKey();
                let symmetricKey = unpadPKCS(decrypt(recipientInfo.value.encryptedKey, rawKey), BlockType.Encrypted);
                let key = await crypto.subtle.importKey("raw", symmetricKey, "AES-CBC", false, ["decrypt"]);
                let decryptedContent = await crypto.subtle.decrypt({ name: "AES-CBC", iv: vector }, key, encryptedContent);
                let mimeAsText = new TextDecoder().decode(email.mime);
                let otherHeaders = mimeAsText.slice(0, mimeAsText.indexOf("\r\n\r\n")).split("\r\n").filter(header => !/Content-/i.test(header)).join("\r\n");
                email.wasEncrypted = true;
                email.downloadComplete = false;
                email.mime = new TextEncoder().encode(otherHeaders + "\r\n" + new TextDecoder().decode(decryptedContent));
                await email.parseMIME(); // checks signature recursively
                await email.saveCompleteMessage();
                return;
              }
            }
          }
        }
      }
    } else if (contentType == "multipart/signed") {
      let signed = email.attachments.last;
      if (signed.mimeType.toLowerCase() == "application/pkcs7-signature") {
        let parts = parseMIMEDirectSubparts(email.mime, contentTypeHeader);
        assert(parts.length == 2, "multipart/signed must have exactly 2 subparts: cleartext and signature, but got " + parts.length);
        let [clearText, signature] = parts;
        let signedData = SignedData.decodeBase64(signature.split("\r\n\r\n")[1]);
        if (!signedData.content.certificates.length || !signedData.content.signerInfos.length) {
          console.log("signed data has no certificate and/or signature");
          return;
        }
        let cert = signedData.content.certificates[0];
        let publicKey = cert.tbsCertificate.publicKey;
        if (publicKey.algorithmIdentifier.algorithm != "rsaEncryption") {
          console.log("certificate does not contain an RSA public key");
          return;
        }
        let signerInfo = signedData.content.signerInfos[0];
        if (signerInfo.signatureAlgorithm.algorithm != "rsaEncryption") {
          console.log("signature was not signed with RSA");
          return;
        }
        let digestAlgorithm = sanitize.translate(signerInfo.digestAlgorithm.algorithm, DigestAlgorithm);
        let messageDigest = new Uint8Array(await crypto.subtle.digest(digestAlgorithm, new TextEncoder().encode(clearText)));
        let digestAttribute = signerInfo.signedAttrs.find(attr => attr.attrType == "messageDigest");
        if (!digestAttribute) {
          console.log("signature did not contain a message digest");
          return;
        }
        if (indexedDB.cmp(OctetString.decode(digestAttribute.attrValue[0]), messageDigest)) {
          console.log("signed digest did not match message");
          return;
        }
        let signedAttrs = Attributes.encode(signerInfo.signedAttrs);
        let attributesDigest = new Uint8Array(await crypto.subtle.digest(digestAlgorithm, signedAttrs));
        /* `await crypto.subtle.verify()` returns `false` on
         * correctly signed messages...
        let key = await crypto.subtle.importKey("spki", SubjectPublicKeyInfo.encode(publicKey), { name: "RSASSA-PKCS1-v1_5", hash: digestAlgorithm }, false, ["verify"]);
        if (await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signerInfo.encryptedDigest, attributesDigest)) {
          let rsa = RSAPublicKey.decode(publicKey.subjectPublicKey.data);
          email.signed = rsa.n.toString(16);
        }
        */
        let rsa = RSAPublicKey.decode(publicKey.subjectPublicKey.data);
        let digestInfo = DigestInfo.decode(unpadPKCS(encrypt(signerInfo.signature, rsa), BlockType.Signed));
        if (digestInfo.digestAlgorithm.algorithm != signerInfo.digestAlgorithm.algorithm) {
          console.log("signature algorithm mismatch");
          return;
        }
        if (indexedDB.cmp(digestInfo.digest, attributesDigest)) {
          console.log("signature did not match attributes");
          return;
        }
        email.signed = rsa.n.toString(16).slice(-16);
      }
    }
  }
}
