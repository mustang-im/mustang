import { EMailProcessor, ProcessingStartOn } from "../../Mail/EMailProccessor";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { EMail } from "../EMail";
import * as openPGP from "openpgp";
import type { Email as MIME } from "postal-mime";
import { MailIdentity } from "../MailIdentity";
import { assert } from "../../util/util";
import { ArrayColl, Collection } from "svelte-collections";

/*
https://github.com/openpgpjs/openpgpjs?tab=readme-ov-file#encrypt-and-decrypt-uint8array-data-with-a-password
https://github.com/openpgpjs/sop-openpgpjs
https://gitlab.com/enigmail/npgpjs/-/blob/main/lib/decrypt.js?ref_type=heads
https://mailman3.ietf.org/mailman3/lists/openpgp@ietf.org/
*/

const isLogging = true;

export class PGPProcessor extends EMailProcessor {
  runOn = ProcessingStartOn.Parse;
  async process(email: EMail, mime: MIME) {
    if (isLogging) console.log("MIME", mime);
    let encrypted = email.attachments.find(a => a.mimeType == "application/pgp-encrypted")?.content;
    if (isLogging) console.log("encrypted", encrypted);
    let outerFrom = email.from.emailAddress;
    let senderCerts = await this.getCertificatesForEmailAddress(email.from.emailAddress, email.sent);
    if (encrypted) {
      let identity = MailIdentity.findIdentity([...email.to.contents, ...email.cc.contents], email.folder?.account)?.identity;
      assert(identity, "Did not find identity for " + email.from.emailAddress);
      let encryptedMessage = await openPGP.readMessage({ binaryMessage: encrypted });

      let privateKey = await this.getPrivateKeyForIdentity(identity);

      let decryptedResult = await openPGP.decrypt({
        message: encryptedMessage,
        decryptionKeys: privateKey.contents,
        format: 'binary',
        verificationKeys: senderCerts.contents,
        date: email.sent, // TODO plus a few minutes
      });
      // check success? throws?
      email.wasEncrypted = true;
      email.signatures = await this.checkSignatures(decryptedResult.signatures, email.sent);
      await this.updateMIME(email, decryptedResult.data, outerFrom);
      await email.saveCompleteMessage();
    }
    let detachedSignature = email.attachments.find(a => a.mimeType == "multipart/signed")?.content;
    if (detachedSignature) {
      let firstPartTODO = email.attachments.find(a => a.mimeType == "application/pgp-signature")?.content; // TODO only the first part
      // TODO normalization for line endings - does openPGP do that?
      let signedContent = await openPGP.readMessage({ binaryMessage: firstPartTODO });
      let signature = await openPGP.readSignature({
        armoredSignature: await detachedSignature.text(),
      });
      let verificationResult = await openPGP.verify({
        message: signedContent,
        signature,
        verificationKeys: senderCerts.contents,
        format: 'binary',
        date: email.sent, // TODO plus a few minutes
      });
      email.signatures = await this.checkSignatures(verificationResult.signatures, email.sent);
      await this.updateMIME(email, verificationResult.data, outerFrom)
    }
  }

  async checkSignatures(signatures: openPGP.VerificationResult[], forDate: Date): Promise<ArrayColl<openPGP.VerificationResult>> {
    let validSignatures = new ArrayColl<openPGP.VerificationResult>();
    for (let sig of signatures) {
      try {
        await sig.verified; // throws for invalid signature
        let sigg = await sig.signature;
        if (sigg.packets[0].created?.getTime() != forDate.getTime()) { // TODO date range
          continue;
        }
        validSignatures.add(sig);
      } catch (ex) {
        if (isLogging) {
          console.error(ex);
        }
      }
    }
    return validSignatures;
  }

  /** Replace the email with this new decrypted email */
  async updateMIME(email: EMail, content: Uint8Array, outerFrom: string) {
    let update = email.folder.newEMail();
    update.mime = content;
    await update.parseMIME();
    email.subject = update.subject;
    if (email.from.emailAddress.toLowerCase() != outerFrom.toLowerCase()) {
      // Treat as phishing
    }
  }

  async getPrivateKeyForIdentity(identity: MailIdentity): Promise<Collection<openPGP.PrivateKey>> {
    let result = new ArrayColl<openPGP.PrivateKey>();
    let privateKeys = new ArrayColl<string>(); // TODO
    for (let keyStr of privateKeys) {
      let encryptedKeys = await openPGP.readPrivateKeys({ armoredKeys: keyStr });
      for (let encryptedKey of encryptedKeys) {
        let password: string; // TODO
        let key = await openPGP.decryptKey({ privateKey: encryptedKey, passphrase: password });
        result.add(key);
      }
    }
    return result;
  }

  async getCertificatesForEmailAddress(emailAddress: string, date: Date): Promise<Collection<openPGP.PublicKey>> {
  }

  async verifySignature(signedContent: any, detachedSignature: any, certs: Collection<openPGP.PublicKey>): Promise<{ ok: boolean, cert: Collection<openPGP.PublicKey>, date: Date }> {
  }
}
