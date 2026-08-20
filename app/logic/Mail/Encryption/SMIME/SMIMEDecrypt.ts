import { Attributes, GCMParameters } from "./SMIMEASN1";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";

/**
 * Decrypts the content of a CMS AuthEnvelopedData with AES-GCM, which both
 * decrypts and authenticates it. RFC 5083 section 2 and RFC 5084 section 3.
 * @param authEnvelopedData the `content` of a decoded `AuthEnvelopedData`
 * @param symmetricKey the key that the content is encrypted with
 * @throws if the content was modified in transit
 */
export async function decryptAuthEnveloped(authEnvelopedData: any, symmetricKey: Uint8Array): Promise<Uint8Array> {
  let contentInfo = authEnvelopedData.authEncryptedContentInfo;
  let { nonce, icvLen } = GCMParameters.decode(contentInfo.contentEncryptionAlgorithm.parameters);
  // RFC 5084 section 3.2 allows only these lengths for the authentication tag
  let tagLength = sanitize.integerRange(Number(icvLen), 12, 16) * 8;
  let key = await crypto.subtle.importKey("raw", symmetricKey, "AES-GCM", false, ["decrypt"]);
  // WebCrypto expects the authentication tag at the end of the ciphertext,
  // whereas CMS sends it separately, in `mac`.
  let ciphertext = new Uint8Array(contentInfo.encryptedContent.length + authEnvelopedData.mac.length);
  ciphertext.set(contentInfo.encryptedContent);
  ciphertext.set(authEnvelopedData.mac, contentInfo.encryptedContent.length);
  return new Uint8Array(await crypto.subtle.decrypt({
    name: "AES-GCM",
    iv: nonce,
    tagLength,
    // RFC 5083 section 2.1: the authenticated attributes are the additional
    // authenticated data, re-encoded with a universal SET OF tag.
    // Without them, there is no additional authenticated data.
    additionalData: authEnvelopedData.authAttrs
      ? Attributes.encode(authEnvelopedData.authAttrs) : new Uint8Array(),
  }, key, ciphertext));
}
