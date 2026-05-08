import { SendEncrypted } from "../SendEncrypted";
import type { EMail } from "../../EMail";
import { getMyPrivateKey, getPublicKeyForPerson } from "../KeyUtils";
import { CreateMIME } from "../../SMTP/CreateMIME";
import { SMIMEPublicKey } from "./SMIMEPublicKey";
import { SMIMEPrivateKey } from "./SMIMEPrivateKey";
import { Oid, GeneralTime, Attributes, DigestInfo, SignedData, Certificate, RSAPublicKey, Null, OctetString, EnvelopedData } from "./SMIMEASN1";
import { decrypt, padFF, padRandom, encrypt } from "./SMIMERSAES";
import { NotReached, assert } from "../../../util/util";
import { gt } from "../../../../l10n/l10n";

export class SMIMESend {
  /**
   * Called before sending email, if S/MIME is to be used.
   * Encrypts and signs the message, as requested.
   * The user must have a usable private key, otherwise mail throws.
   * If encryption is requested, all recipients must have usable public keys,
   * otherwise mail throws. The caller is responsible to ensure that.
   *
   * @returns a new email that is encrypted and/or signed.
   *   The original email is untouched.
   */
  static async encryptAndSign(mail: EMail): Promise<EMail> {
    let privateKey = getMyPrivateKey(mail.identity, SMIMEPrivateKey);
    assert(privateKey, gt`Please first set up S/MIME encryption for yourself, in Settings | Mail | Identity | Encryption`);
    let result = SendEncrypted.cloneEMail(mail);
    let mime = await CreateMIME.getMIME(mail);
    let mimeAsText = new TextDecoder().decode(mime);
    if (mail.signed) {
      // Only the body and content type are signed, not the headers.
      let pos = mimeAsText.indexOf("\r\n\r\n");
      let headers = mimeAsText.slice(0, pos).split(/\r\n\b/);
      let contentTypeHeader = headers.find(header => /^Content-Type: /i.test(header)) ?? "Content-Type: text/plain";
      let otherHeaders = headers.filter(header => !/^Content-/i.test(header));
      mimeAsText = contentTypeHeader + mimeAsText.slice(pos);
      let messageDigest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(mimeAsText)));
      let signedAttributes = [{
        attrType: "contentType",
        attrValue: [Oid.encode("data")],
      }, {
        attrType: "messageDigest",
        attrValue: [OctetString.encode(messageDigest)],
      }, {
        attrType: "signingTime",
        attrValue: [GeneralTime.encode(Date.now())],
      }];
      let encodedAttrs = Attributes.encode(signedAttributes);
      let attributesDigest = new Uint8Array(await crypto.subtle.digest("SHA-256", encodedAttrs));
      let digestInfo = {
        digestAlgorithm: {
          algorithm: "sha256",
          parameters: Null.encode(),
        },
        digest: attributesDigest,
      };
      let rawKey = await privateKey.decryptKey();
      let signature = decrypt(padFF(DigestInfo.encode(digestInfo), rawKey), rawKey);
      let myCertificate = Certificate.decodePEM(privateKey.certificate, { label: "CERTIFICATE"});
      let signerInfo = {
        version: 1n,
        sid: {
          type: "issuerAndSerialNumber",
          value: {
            issuer: myCertificate.tbsCertificate.subject,
            serialNumber: myCertificate.tbsCertificate.serialNumber,
          },
        },
        digestAlgorithm: {
          algorithm: "sha256",
          parameters: Null.encode(),
        },
        signedAttrs: signedAttributes,
        signatureAlgorithm: {
          algorithm: "rsaEncryption",
          parameters: Null.encode(),
        },
        signature: signature,
      };
      let signedData = {
        contentType: "signedData",
        content: {
          version: 1n,
          digestAlgorithms: [{
            algorithm: "sha256",
            parameters: Null.encode(),
          }],
          contentInfo: {
            contentType: "data",
          },
          certificates: [myCertificate],
          signerInfos: [signerInfo],
        },
      };
      for (let cert of privateKey.chain) {
        signedData.content.certificates.push(Certificate.decodePEM(cert.certificate, { label: "CERTIFICATE" }));
      }
      /*
      let forge = await import("node-forge");
      let pkcs7 = forge.pkcs7.createSignedData();
      pkcs7.content = forge.util.createBuffer(mimeAsText, "utf8");
      pkcs7.addCertificate(privateKey.certificate);
      for (let key of privateKey.chain) {
        pkcs7.addCertificate(key.certificate);
      }
      pkcs7.addSigner({
        key: await privateKey.decryptKey(),
        certificate: privateKey.certificate,
        digestAlgorithm: forge.pki.oids.sha256,
        authenticatedAttributes: [
          { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
          { type: forge.pki.oids.messageDigest },
          { type: forge.pki.oids.signingTime },
        ],
      });
      pkcs7.sign({ detached: true });
      let asn1 = pkcs7.toAsn1();
      let der = forge.asn1.toDer(asn1);
      */
      let boundary = "----" + crypto.randomUUID().replace(/-/g, "");
      mimeAsText = [
        `Content-Type: multipart/signed; protocol="application/pkcs7-signature"; micalg=sha256; boundary="${boundary}"`,
        ...otherHeaders,
        '',
        `--${boundary}`,
        mimeAsText,
        `--${boundary}`,
        'Content-Type: application/pkcs7-signature; name="smime.p7s"',
        'Content-Transfer-Encoding: base64',
        'Content-Disposition: attachment; filename="smime.p7s"',
        '',
        //...btoa(der.getBytes()).match(/.{1,76}/g),
        ... SignedData.encodeBase64(signedData).match(/.{1,76}/g),
        `--${boundary}--`,
        '',
      ].join("\r\n");
      pos = mimeAsText.indexOf("\r\n\r\n");
    }
    if (mail.shouldEncrypt) {
      // Only the body and content type are encrypted, not the headers.
      let pos = mimeAsText.indexOf("\r\n\r\n");
      let headers = mimeAsText.slice(0, pos).split(/\r\n\b/);
      let contentTypeHeader = headers.find(header => /^Content-Type: /i.test(header)) ?? "Content-Type: text/plain";
      let otherHeaders = headers.filter(header => !/^Content-/i.test(header));
      mimeAsText = contentTypeHeader + mimeAsText.slice(pos);
      mime = new TextEncoder().encode(mimeAsText);
      let recipientKeys = mail.allRecipients().contents.flatMap(puid =>
        getPublicKeyForPerson(puid.findPerson(), SMIMEPublicKey));
      if (!recipientKeys.some(key => key.id == privateKey.id)) {
        recipientKeys.push(privateKey);
      }
      let symmetricKey = new Uint8Array(32);
      let vector = new Uint8Array(16);
      crypto.getRandomValues(symmetricKey);
      crypto.getRandomValues(vector);
      let key = await crypto.subtle.importKey("raw", symmetricKey, "AES-CBC", false, ["encrypt"]);
      let pkcs7 = {
        contentType: "envelopedData",
        content: {
          version: 0n,
          recipientInfos: [],
          encryptedContentInfo: {
            contentType: "data",
            contentEncryptionAlgorithm: {
              algorithm: "aes256cbc",
              parameters: OctetString.encode(vector),
            },
            encryptedContent: new Uint8Array(await crypto.subtle.encrypt({ name: "AES-CBC", iv: vector }, key, mime)),
          }
        }
      };
      for (let recipientKey of recipientKeys) {
        let cert = Certificate.decodePEM(recipientKey.certificate, { label: "CERTIFICATE" });
        let rsa = RSAPublicKey.decode(cert.tbsCertificate.publicKey.subjectPublicKey.data);
        pkcs7.content.recipientInfos.push({
          type: "ktri",
          value: {
            version: 0n,
            rid: {
              type: "issuerAndSerialNumber",
              value: {
                issuer: cert.tbsCertificate.issuer,
                serialNumber: cert.tbsCertificate.serialNumber,
              }
            },
            keyEncryptionAlgorithm: {
              algorithm: "rsaEncryption",
              parameters: Null.encode(),
            },
            encryptedKey: encrypt(padRandom(symmetricKey, rsa), rsa),
          },
        });
      }
      let der = EnvelopedData.encode(pkcs7);
      let base64 = der.toBase64?.() ?? toBase64(der);
      mimeAsText = [
        'Content-Type: application/pkcs7-mime; smime-type=enveloped-data; name="smime.p7m"',
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="smime.p7m"`,
        ...otherHeaders,
        '',
        ...base64.match(/.{1,76}/g),
        '',
      ].join("\r\n");
    }
    result.sendRawMIME = mimeAsText;
    return result;
  }
}

function toBase64(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf));
}

declare global {
  interface Uint8Array {
    toBase64(options?: { alphabet?: "base64" | "base64url", omitPadding?: boolean } ): string;
  }
}
