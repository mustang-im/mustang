import { EMailProcessor, ProcessingStartOn } from "../../EMailProcessor";
import { EMail } from "../../EMail";
import { MailIdentity } from "../../MailIdentity";
import { PGPPrivateKey } from "./PGPPrivateKey";
import { PGPPublicKey } from "./PGPPublicKey";
import { appGlobal } from "../../../app";
import { assert } from "../../../util/util";
import { ArrayColl, Collection } from "svelte-collections";
import type { Email as MIME } from "postal-mime";
import type OpenPGP from "openpgp";

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
    let encrypted = email.attachments.find(a => a.mimeType == "application/pgp-encrypted")?.content;
    let detachedSignature = email.attachments.find(a => a.mimeType == "multipart/signed")?.content;
    if (!encrypted && !detachedSignature) {
      return;
    }
    let openPGP = await import("openpgp");
    if (isLogging) console.log("MIME", mime, "encrypted", encrypted);
    let outerFrom = email.from.emailAddress;
    let senderPublicKeys = await this.getPublicKeysForEmailAddress(email.from.emailAddress, email.sent, openPGP);
    let senderPGPKeys = senderPublicKeys.contents.map(publicKey => publicKey.pgpKey!);
    if (encrypted) {
      let identity = MailIdentity.findIdentity([...email.to.contents, ...email.cc.contents], email.folder?.account)?.identity;
      assert(identity, "Did not find identity for " + email.from.emailAddress);
      let encryptedMessage = await openPGP.readMessage({ binaryMessage: encrypted });

      let privateKey = await this.getPrivateKeysForIdentity(identity, openPGP);

      let decryptedResult = await openPGP.decrypt({
        message: encryptedMessage,
        decryptionKeys: privateKey.contents,
        format: 'binary',
        verificationKeys: senderPGPKeys,
        date: email.sent, // TODO plus a few minutes
      });
      // check success? throws?
      email.wasEncrypted = true;
      email.signedWithKey = await this.checkSignatures(decryptedResult.signatures, senderPublicKeys, email.sent);
      email.signed = !!email.signedWithKey;
      await this.updateMIME(email, decryptedResult.data, outerFrom);
      await email.saveCompleteMessage();
    }
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
        verificationKeys: senderPGPKeys,
        format: 'binary',
        date: email.sent, // TODO plus a few minutes
      });
      email.signedWithKey = await this.checkSignatures(verificationResult.signatures, senderPublicKeys, email.sent);
      email.signed = !!email.signedWithKey;
      await this.updateMIME(email, verificationResult.data, outerFrom)
    }
  }

  async checkSignatures(signatures: OpenPGPVerificationResult[], senderPublicKeys: Collection<PGPPublicKey>, forDate: Date): Promise<PGPPublicKey | null> {
    let validSignatures = new ArrayColl<OpenPGPVerificationResult>();
    for (let sig of signatures) {
      try {
        await sig.verified; // throws for invalid signature
        let sigg = await sig.signature;
        let packet = sigg.packets[0]; // TODO n packets
        if (!packet || packet.created && Math.abs(packet.created?.getTime() - forDate.getTime()) > 2000) {
          continue;
        }
        validSignatures.add(sig);
      } catch (ex) {
        if (isLogging) {
          console.error(ex);
        }
      }
    }

    for (let sig of validSignatures.each) {
      for (let publicKey of senderPublicKeys.each) {
        if (sig.keyID.equals(publicKey.pgpKey!.getKeyID())) {
          return publicKey;
        }
      }
    }
    return null;
  }

  /** Replace the email with this new decrypted email */
  async updateMIME(email: EMail, content: Uint8Array, outerFrom: string) {
    if (email.from.emailAddress.toLowerCase() != outerFrom.toLowerCase()) {
      // Treat as phishing
    }
    email.downloadComplete = false;
    email.mime = content;
    await email.parseMIME();
    await email.saveCompleteMessage();
  }

  async getPrivateKeysForIdentity(identity: MailIdentity, openPGP: any): Promise<Collection<OpenPGP.PrivateKey>> {
    let result = new ArrayColl<OpenPGP.PrivateKey>();
    for (let privateKey of identity.encryptionPrivateKeys.each) {
      if (!(privateKey instanceof PGPPrivateKey && privateKey.privateKeyArmored)) {
        continue;
      }
      let encryptedKey = await openPGP.readPrivateKey({ armoredKey: privateKey.privateKeyArmored });
      let password = ""; // TODO
      let key = await openPGP.decryptKey({ privateKey: encryptedKey, passphrase: password });
      result.add(key);
    }
    return result;
  }

  async getPublicKeysForEmailAddress(emailAddress: string, date: Date, openPGP: any): Promise<Collection<PGPPublicKey>> {
    let keys = new ArrayColl<PGPPublicKey>();
    let contacts = appGlobal.persons.filterOnce(p => p.emailAddresses.some(ce => ce.value == emailAddress));
    for (let contact of contacts.each) {
      for (let publicKey of contact.encryptionPublicKeys.each) {
        if (!(publicKey instanceof PGPPublicKey && publicKey.publicKeyArmored)) {
          continue;
        }
        publicKey.pgpKey ??= await openPGP.readKey({ armoredKey: publicKey.publicKeyArmored });
        keys.add(publicKey);
      }
    }
    return keys;
  }
}

type OpenPGPVerificationResult = {
  keyID: OpenPGP.KeyID,
  verified: Promise<boolean>,
  signature: Promise<OpenPGP.Signature>,
};
