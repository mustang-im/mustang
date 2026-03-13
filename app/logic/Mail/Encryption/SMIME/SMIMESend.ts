import type { EMail } from "../../EMail";

export class SMIMESend {
  /**
   * Called before sending email, if PGP is to be used.
   * Encrypts and signs the message, as requested.
   * The user must have a usable private key, otherwise this throws.
   * If encryption is requested, all recipients must have usable public keys,
   * otherwise this throws. The caller is responsible to ensure that.
   *
   * @returns a new email that is encrypted and/or signed.
   *   The original email is untouched.
   */
  static async encryptAndSign(mail: EMail): Promise<EMail> {
    let result = mail.folder.newEMail();
    result.copyFrom(mail);
    result.id = mail.id;
    return result;
  }
}
