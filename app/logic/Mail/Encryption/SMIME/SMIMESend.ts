import { SendEncrypted } from "../SendEncrypted";
import type { EMail } from "../../EMail";
import { getMyPrivateKey, getPublicKeyForPerson } from "../KeyUtils";
import { CreateMIME } from "../../SMTP/CreateMIME";
import { SMIMEPublicKey } from "./SMIMEPublicKey";
import { SMIMEPrivateKey } from "./SMIMEPrivateKey";
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
    let headers = mimeAsText.slice(0, mimeAsText.indexOf("\r\n\r\n")).split("\r\n");
    let forge = await import("node-forge");
    if (mail.signed) {
      if (!mail.shouldEncrypt) {
        // Some MTAs strip User-Agent headers on MIME parts.
        mimeAsText = mimeAsText.replace(/^User-Agent: .+\r\n/m, "");
      }
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
      let boundary = "----" + crypto.randomUUID().replace(/-/g, "");
      mimeAsText = [
        `Content-Type: multipart/signed; protocol="application/pkcs7-signature"; micalg=sha256; boundary ="${boundary}"`,
        ... headers.filter(header => !/^Content-Type: /i.test(header)),
        '',
        `--${boundary}`,
        mimeAsText,
        `--${boundary}`,
        'Content-Type: application/pkcs7-signature; name="smime.p7s"',
        'Content-Transfer-Encoding: base64',
        'Content-Disposition: attachment; filename="smime.p7s"',
        '',
        ... btoa(der.getBytes()).match(/.{1,76}/g),
        `--${boundary}--`,
        '',
      ].join("\r\n");
    }
    if (mail.shouldEncrypt) {
      let recipientKeys = mail.allRecipients().contents.flatMap(puid =>
        getPublicKeyForPerson(puid.findPerson(), SMIMEPublicKey));
      if (!recipientKeys.some(key => key.id == privateKey.id)) {
        recipientKeys.push(privateKey);
      }
      let pkcs7 = forge.pkcs7.createEnvelopedData();
      pkcs7.content = forge.util.createBuffer(mimeAsText, "utf8");
      for (let recipientKey of recipientKeys) {
        let cert = forge.pki.certificateFromPem(recipientKey.certificate);
        pkcs7.addRecipient(cert);
      }
      pkcs7.encrypt();
      let asn1 = pkcs7.toAsn1();
      let der = forge.asn1.toDer(asn1);
      mimeAsText = [
        'Content-Type: application/pkcs7-mime; smime-type=enveloped-data; name="smime.p7m"',
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="smime.p7m"`,
        ... headers.filter(header => !/^Content-Type: /i.test(header)),
        '',
        ... btoa(der.getBytes()).match(/.{1,76}/g),
        '',
      ].join("\r\n");
    }
    result.sendRawMIME = mimeAsText;
    return result;
  }
}
