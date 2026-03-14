import type { EMail } from "../EMail";
import type { PersonUID } from "../../Abstract/PersonUID";
import { PGPSend } from "./PGP/PGPSend";
import { PGPPublicKey } from "./PGP/PGPPublicKey";
import { PGPPrivateKey } from "./PGP/PGPPrivateKey";
import { SMIMESend } from "./SMIME/SMIMESend";
import { SMIMEPublicKey } from "./SMIME/SMIMEPublicKey";
import { SMIMEPrivateKey } from "./SMIME/SMIMEPrivateKey";
import { UserError, assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl } from "svelte-collections";

export class SendEncrypted {
  /**
   * Encrypts and signs the email as needed, based on flags
   * `mail.shouldEncrypt` and `mail.signed` .
   * If no encryption nor signing needed, returns the input `mail` object.
   * Otherwise, checks the recipients, whether we have keys for them, and
   * determines whether to use PGP or S/MIME, and calls the appropriate implementation.
   * @returns the same or a new mail object, with the same content, but encrypted and/or signed
   */
  static async encryptAsNeeded(mail: EMail): Promise<EMail> {
    if (mail.mustEncrypt) {
      assert(mail.shouldEncrypt, "shouldEncrypt must be set whenever mustEncrypt is set");
    }

    if (mail.shouldEncrypt) {
      assert(mail.bcc.isEmpty, "Cannot encrypt with BCC recipients"); // TODO send BCC as separate email
      // If the user wants encryption, then use all applicable keys. `useToEncrypt` is only for the default.
      let privateKeys = mail.identity.encryptionPrivateKeys.filterOnce(privateKey => !privateKey.obsolete);
      assert(privateKeys.hasItems, gt`Please first set up encryption for yourself, in Settings | Mail | Identity | Encryption`);
      let recipients = new ArrayColl<PersonUID>(mail.allRecipients());
      if (privateKeys.find(privateKey => privateKey instanceof PGPPrivateKey) &&
          recipients.every(puid =>
            puid.findPerson()?.encryptionPublicKeys.some(key =>
              key instanceof PGPPublicKey && !key.obsolete))) {
        return await PGPSend.encryptAndSign(mail);
      } else if (privateKeys.find(privateKey => privateKey instanceof SMIMEPrivateKey) &&
          recipients.every(puid =>
            puid.findPerson()?.encryptionPublicKeys.some(key =>
              key instanceof SMIMEPublicKey && !key.obsolete))) {
        return await SMIMESend.encryptAndSign(mail);
      } else {
        throw new UserError(gt`Cannot encrypt to all recipients using PGP or S/MIME`);
      }
    } else if (mail.signed) {
      let privateKeys = mail.identity.encryptionPrivateKeys.filterOnce(privateKey => !privateKey.obsolete);
      if (privateKeys.find(privateKey => privateKey instanceof PGPPrivateKey && privateKey.useToSign)) {
        return await PGPSend.encryptAndSign(mail);
      } else if (privateKeys.find(privateKey => privateKey instanceof SMIMEPrivateKey && privateKey.useToSign)) {
        return await SMIMESend.encryptAsNeeded(mail);
      } else {
        throw new UserError(gt`Please first set up encryption and create a signing key for yourself, in Settings | Mail | Identity | Encryption`);
      }
    } else {
      return mail;
    }
  }

  static cloneEMail(mail: EMail): EMail {
    let result = mail.folder.newEMail();
    // <copied from="EMail.copyFrom()">, because we want to copy only the delivery properties, not the content
    result.id = mail.id;
    result.folder = mail.folder;
    result.identity = mail.identity;
    result.from = mail.from;
    result.replyTo = mail.replyTo;
    result.to.replaceAll(mail.to);
    result.cc.replaceAll(mail.cc);
    result.tags.replaceAll(mail.tags);
    result.isDraft = mail.isDraft;
    // </copied>

    result.wasEncrypted = mail.wasEncrypted;
    result.signed = mail.signed;
    return result;
  }
}
