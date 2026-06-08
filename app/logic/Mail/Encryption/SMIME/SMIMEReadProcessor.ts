import { EMailProcessor, ProcessingStartOn } from "../../EMailProcessor";
import type { EMail } from "../../EMail";
import { MailIdentity } from "../../MailIdentity";
import { SMIMEPrivateKey } from "./SMIMEPrivateKey";
import { parseMIMEDirectSubparts } from "../MIME";
import { assert, blobToBase64 } from "../../../util/util";
import { ArrayColl, Collection } from "svelte-collections";
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
      let forge = await import("node-forge");
      // PostalMIME has decoded the base64 for us but forge wants the base64...
      let pem = "-----BEGIN PKCS7-----\r\n" + await blobToBase64(encrypted.content) + "\r\n-----END PKCS7-----\r\n";
      let pkcs7 = forge.pkcs7.messageFromPem(pem);
      // XXX what if you were BCC'd?
      for (let recipient of email.allRecipients()) {
        let identity = MailIdentity.findIdentity(new ArrayColl([recipient]), email.folder?.account)?.identity;
        if (identity) {
          for (let privateKey of identity.encryptionPrivateKeys) {
            if (privateKey instanceof SMIMEPrivateKey) {
              let cert = forge.pki.certificateFromPem(privateKey.certificate);
              let recipient = pkcs7.findRecipient(cert);
              if (recipient) {
                let rsa = await privateKey.decryptKey();
                pkcs7.decrypt(recipient, rsa);
                let originalFrom = email.from.emailAddress.toLowerCase();
                email.wasEncrypted = true;
                email.downloadComplete = false;
                email.mime = new TextEncoder().encode(pkcs7.content.toString());
                email.resetProperties();
                await email.parseMIME();
                // Signature will have been checked recursively
                if (email.from.emailAddress.toLowerCase() != originalFrom) {
                  email.signed = null;
                }
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
        let forge = await import("node-forge");
        let pem = "-----BEGIN PKCS7-----\r\n" + signature.split("\r\n\r\n")[1] + "\r\n-----END PKCS7-----\r\n";
        let pkcs7 = forge.pkcs7.messageFromPem(pem);
        // forge hasn't implemented signature verification yet.
        let oid = forge.asn1.derToOid(pkcs7.rawCapture.digestAlgorithm);
        let digestAlgorithm = forge.md[forge.pki.oids[oid]];
        let digest = digestAlgorithm.create().start().update(clearText).digest().bytes();
        let messageDigest = pkcs7.rawCapture.authenticatedAttributes.find(attr => forge.asn1.derToOid(attr.value[0].value) == forge.pki.oids.messageDigest);
        if (digest != messageDigest?.value?.[1]?.value?.[0]?.value) {
          console.log("Ignoring signature as its digest does not match the message");
          return;
        }
        let authenticatedAttributes = forge.asn1.toDer(forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, pkcs7.rawCapture.authenticatedAttributes)).getBytes();
        let attributesDigest = digestAlgorithm.create().start().update(authenticatedAttributes).digest().bytes();
        if (pkcs7.certificates[0].publicKey.verify(attributesDigest, pkcs7.rawCapture.signature)) {
          email.signed = pkcs7.certificates[0].publicKey.n.toString(16);
          // TODO: need to all user to save the certificate
        }
      }
    }
  }
}
