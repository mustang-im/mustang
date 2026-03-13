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
   * If no encryption nor signing needed, returns the input email unchanged.
   * Otherwise, checks the recipients and determines whether to use PGP or
   */
  static async encryptAsNeeded(mail: EMail): Promise<EMail> {
    if (mail.mustEncrypt) {
      assert(mail.shouldEncrypt, "shouldEncrypt must be set whenever mustEncrypt is set");
    }

    if (mail.shouldEncrypt) {
      assert(mail.bcc.isEmpty, "Cannot encrypt with BCC recipients"); // TODO send BCC as separate email
      assert(mail.identity.encryptionPrivateKeys.some(privateKey => !privateKey.obsolete), gt`Please first set up encryption for yourself, in Settings | Mail | Identity | Encryption`);
      let recipients = new ArrayColl<PersonUID>(mail.allRecipients());
      if (mail.identity.encryptionPrivateKeys.some(privateKey =>
            privateKey instanceof PGPPrivateKey && !privateKey.obsolete) &&
          recipients.every(puid =>
            puid.findPerson()?.encryptionPublicKeys.some(key =>
              key instanceof PGPPublicKey && !key.obsolete && key.useToEncrypt))) {
        return await PGPSend.encryptAndSign(mail);
      } else if (
          mail.identity.encryptionPrivateKeys.some(privateKey =>
            privateKey instanceof SMIMEPrivateKey && !privateKey.obsolete) &&
          recipients.every(puid =>
            puid.findPerson()?.encryptionPublicKeys.some(key =>
              key instanceof SMIMEPublicKey && !key.obsolete && key.useToEncrypt))) {
        return await SMIMESend.encryptAndSign(mail);
      } else {
        throw new UserError(gt`Cannot encrypt to all recipients using PGP or S/MIME`);
      }
    } else if (mail.signed) {
      if (mail.identity.encryptionPrivateKeys.some(privateKey =>
        privateKey instanceof PGPPrivateKey && !privateKey.obsolete && privateKey.useToSign)) {
        return await PGPSend.encryptAndSign(mail);
      } else if (
        mail.identity.encryptionPrivateKeys.some(privateKey =>
          privateKey instanceof SMIMEPrivateKey && !privateKey.obsolete && privateKey.useToSign)) {
        return await SMIMESend.encryptAndSign(mail);
      } else {
        throw new UserError(gt`Please first set up encryption and create a signing key for yourself, in Settings | Mail | Identity | Encryption`);
      }
      return mail;
    } else {
      return mail;
    }
  }
}
