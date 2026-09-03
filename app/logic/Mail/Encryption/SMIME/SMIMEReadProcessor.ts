import { EMailProcessor, ProcessingStartOn } from "../../EMailProcessor";
import type { EMail } from "../../EMail";
import { MailIdentity } from "../../MailIdentity";
import { EncryptionSystem } from "../enums";
import { SMIMEPrivateKey } from "./SMIMEPrivateKey";
import { ContentInfo, EnvelopedData, AuthEnvelopedData, Certificate, OctetString, RC2CBCParameters, SignedData } from "./SMIMEASN1";
import { decryptAuthEnveloped } from "./SMIMEDecrypt";
import { rc2Decrypt, tripleDESDecrypt } from "./legacyCiphers";
import { BlockType, unpadPKCS, decrypt } from "./SMIMERSAES";
import { verifySignedData, sameName } from "./SMIMEVerify";
import { parseMIMEDirectSubpartsBytes, parseHeaderParameters } from "../MIME";
import { UserError, assert } from "../../../util/util";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { gt } from "../../../../l10n/l10n";
import { ArrayColl } from "svelte-collections";
import type { Email as PostalEmail } from "postal-mime";

export class SMIMEReadProcessor extends EMailProcessor {
  runOn = ProcessingStartOn.Parse;
  async process(email: EMail, postal: PostalEmail) {
    // There is a direct accessor to the content type in the PostalMIME object
    // itself, but we don't have that here. And to get the headers in the
    // EMail object requires an extra parse, which seems wasteful. So
    // let's fish the header out of the PostalEmail object...
    let contentTypeHeader = sanitize.string(postal.headers.find(header => header.key == "content-type")?.value, "");
    let contentType = parseHeaderParameters(contentTypeHeader).$main;
    if (contentType == "application/pkcs7-mime" ||
        contentType == "application/x-pkcs7-mime") { // legacy type name, used by Outlook
      // The whole message is a CMS blob. It's the only body part, but fsr
      // this is an attachment.
      let cms = email.attachments.first?.content;
      if (!cms) {
        console.warn("pkcs7-mime message has no content");
        return;
      }
      let blob = new Uint8Array(await cms.arrayBuffer());
      let type = ContentInfo.decode(blob, { berToDER: true }).contentType;
      if (type == "signedData") {
        await this.readOpaqueSigned(email, blob);
      } else if (type == "envelopedData") {
        await this.readEncrypted(email, blob);
      } else if (type == "authEnvelopedData") {
        await this.readAuthEncrypted(email, blob);
      }
    } else if (contentType == "multipart/signed") {
      await this.readClearSigned(email, contentTypeHeader);
    }
  }

  /** Decrypts an encrypted (enveloped-data) message and replaces the
   * message content with the decrypted content. */
  protected async readEncrypted(email: EMail, blob: Uint8Array) {
    email.system = EncryptionSystem.SMIME;
    let envelopedData = EnvelopedData.decode(blob, { berToDER: true });
    let { contentEncryptionAlgorithm, encryptedContent } = envelopedData.content.encryptedContentInfo;
    let cipher = contentEncryptionAlgorithm.algorithm;
    if (!sanitize.enum(cipher, ["aes128cbc", "aes192cbc", "aes256cbc", "desEDE3CBC", "rc2CBC"], null)) {
      throw new UserError(gt`This message is encrypted with ${algorithmName(cipher)}, which is not supported`);
    }
    let symmetricKey = await this.decryptSymmetricKey(email, envelopedData.content.recipientInfos);
    let decryptedContent: Uint8Array;
    if (cipher == "desEDE3CBC") {
      // Apple Mail always encrypts with Triple DES, and Thunderbird does
      // for recipients with a short key. WebCrypto implements neither
      // Triple DES nor RC2, so we decrypt them ourselves.
      decryptedContent = tripleDESDecrypt(encryptedContent, symmetricKey, OctetString.decode(contentEncryptionAlgorithm.parameters));
    } else if (cipher == "rc2CBC") {
      let { rc2ParameterVersion, iv } = RC2CBCParameters.decode(contentEncryptionAlgorithm.parameters);
      // RFC 3370 section 5.2: below 256, the version is a code for the
      // effective key length, from 256 up it is that length in bits itself.
      let version = Number(rc2ParameterVersion);
      let effectiveKeyBits = { 58: 128, 120: 64, 160: 40 }[version] ?? version;
      decryptedContent = rc2Decrypt(encryptedContent, symmetricKey, iv, sanitize.integerRange(effectiveKeyBits, 8, 1024));
    } else {
      let vector = OctetString.decode(contentEncryptionAlgorithm.parameters);
      let key = await crypto.subtle.importKey("raw", symmetricKey, "AES-CBC", false, ["decrypt"]);
      decryptedContent = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-CBC", iv: vector }, key, encryptedContent));
    }
    email.wasEncrypted = true;
    await this.unwrapMIME(email, decryptedContent);
  }

  /** Decrypts a message that was encrypted with an authenticating cipher,
   * i.e. AES-GCM, and replaces the message content with the decrypted content.
   * RFC 8551 requires AES-GCM, and CMS uses it with its own content type,
   * not with the `EnvelopedData` that the AES-CBC ciphers use. */
  protected async readAuthEncrypted(email: EMail, blob: Uint8Array) {
    email.system = EncryptionSystem.SMIME;
    let authEnvelopedData = AuthEnvelopedData.decode(blob, { berToDER: true }).content;
    let cipher = authEnvelopedData.authEncryptedContentInfo.contentEncryptionAlgorithm.algorithm;
    if (!sanitize.enum(cipher, ["aes128gcm", "aes192gcm", "aes256gcm"], null)) {
      throw new UserError(gt`This message is encrypted with ${algorithmName(cipher)}, which is not supported`);
    }
    let symmetricKey = await this.decryptSymmetricKey(email, authEnvelopedData.recipientInfos);
    email.wasEncrypted = true;
    await this.unwrapMIME(email, await decryptAuthEnveloped(authEnvelopedData, symmetricKey));
  }

  /** Finds the private key of one of our identities that this message was
   * encrypted to, and decrypts the symmetric content key with it.
   * @throws if the message was not encrypted to any of our keys */
  protected async decryptSymmetricKey(email: EMail, recipientInfos: any[]): Promise<Uint8Array> {
    // XXX what if you were BCC'd?
    let unsupportedKeyTransport: string | null = null;
    for (let recipient of email.allRecipients()) {
      let identity = MailIdentity.findIdentity(new ArrayColl([recipient]), email.folder?.account)?.identity;
      if (identity) {
        for (let privateKey of identity.encryptionPrivateKeys) {
          // A key that the user just created has no certificate yet
          if (!(privateKey instanceof SMIMEPrivateKey) || !privateKey.certificate) {
            continue;
          }
          let cert = Certificate.decodePEM(privateKey.certificate, { label: "CERTIFICATE" });
          let extensionValue = cert.tbsCertificate.extensions?.find(extension => extension.extnID == "subjectKeyIdentifier")?.extnValue;
          // The extension wraps the identifier in another OCTET STRING
          let ourKeyIdentifier = extensionValue && OctetString.decode(extensionValue);
          for (let recipientInfo of recipientInfos) {
            if (recipientInfo.type != "ktri") {
              continue;
            }
            // Senders name our certificate either by its issuer and serial
            // number, or by its subjectKeyIdentifier. RFC 5652 section 6.2.1
            let rid = recipientInfo.value.rid;
            let isForOurCertificate = rid.type == "issuerAndSerialNumber"
              ? rid.value.serialNumber == cert.tbsCertificate.serialNumber &&
                sameName(rid.value.issuer, cert.tbsCertificate.issuer)
              : !!ourKeyIdentifier && !indexedDB.cmp(rid.value, ourKeyIdentifier);
            if (!isForOurCertificate) {
              continue;
            }
            let keyEncryptionAlgorithm = recipientInfo.value.keyEncryptionAlgorithm.algorithm;
            if (keyEncryptionAlgorithm != "rsaEncryption") {
              unsupportedKeyTransport = algorithmName(keyEncryptionAlgorithm);
              continue;
            }
            let rawKey = await privateKey.decryptKey();
            return unpadPKCS(decrypt(recipientInfo.value.encryptedKey, rawKey), BlockType.Encrypted);
          }
        }
      }
    }
    if (unsupportedKeyTransport) {
      throw new UserError(gt`The key of this message is encrypted with ${unsupportedKeyTransport}, which is not supported`);
    }
    throw new UserError(gt`This message is encrypted, and the key is not available`);
  }

  /** Reads an opaque-signed message (used by Outlook), where the whole
   * message is wrapped inside the SignedData blob, instead of being sent
   * in cleartext with a detached signature (`multipart/signed`).
   * Extracts the wrapped message, so that it displays, and verifies the
   * signature over it. */
  protected async readOpaqueSigned(email: EMail, blob: Uint8Array) {
    email.system = EncryptionSystem.SMIME;
    let signedData = SignedData.decode(blob, { berToDER: true });
    let contentInfo = signedData.content.contentInfo;
    if (contentInfo.contentType != "data" || !contentInfo.content) {
      // e.g. a certs-only message, contains no message to show
      return;
    }
    let content = OctetString.decode(contentInfo.content);
    // show the msg, even if the signature is invalid
    await this.unwrapMIME(email, content);
    email.rememberSigner(await verifySignedData(signedData, content));
  }

  /** Verifies a cleartext message with a detached signature
   * (`multipart/signed`). */
  protected async readClearSigned(email: EMail, contentTypeHeader: string) {
    let signatureMimeType = email.attachments.last?.mimeType.toLowerCase();
    if (signatureMimeType != "application/pkcs7-signature" &&
        signatureMimeType != "application/x-pkcs7-signature") { // legacy type name
      return;
    }
    email.system = EncryptionSystem.SMIME;
    let parts = parseMIMEDirectSubpartsBytes(email.mime, contentTypeHeader);
    assert(parts.length == 2, "multipart/signed must have exactly 2 subparts: cleartext and signature, but got " + parts.length);
    let [clearText, signature] = parts;
    let signatureBase64 = new TextDecoder().decode(signature).split("\r\n\r\n")[1];
    if (!signatureBase64) {
      console.warn("signature part has no content");
      return;
    }
    let signedData = SignedData.decodeFromBase64(signatureBase64, { berToDER: true });
    email.rememberSigner(await verifySignedData(signedData, clearText));
  }

  /** Replaces the message with the MIME entity extracted from the CMS
   * wrapper, keeping the other message headers, and parses it. */
  protected async unwrapMIME(email: EMail, content: Uint8Array) {
    let mimeAsText = new TextDecoder().decode(email.mime);
    // Split on CRLF, but keep folded continuation lines (those starting with
    // whitespace) attached to their header.
    let otherHeaders = mimeAsText.slice(0, mimeAsText.indexOf("\r\n\r\n")).split(/\r\n(?![ \t])/).filter(header => !/^Content-/i.test(header)).join("\r\n");
    email.downloadComplete = false;
    let headerBytes = new TextEncoder().encode(otherHeaders + "\r\n");
    let mime = new Uint8Array(headerBytes.length + content.length);
    mime.set(headerBytes);
    mime.set(content, headerBytes.length);
    email.mime = mime;
    await email.parseMIME(); // checks signature recursively
    await email.saveCompleteMessage();
  }
}

/** Names an algorithm for the user: our name for its OID, or the OID
 * itself, for the algorithms that we do not know. */
function algorithmName(algorithm: string | number[]): string {
  return Array.isArray(algorithm) ? algorithm.join(".") : algorithm;
}
