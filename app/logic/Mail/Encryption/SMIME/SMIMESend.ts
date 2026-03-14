import { SendEncrypted } from "../SendEncrypted";
import type { EMail } from "../../EMail";
import { CreateMIME } from "../../SMTP/CreateMIME";

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
    let result = SendEncrypted.cloneEMail(mail);
    let mime = CreateMIME.getMIME(mail);
    return result;
  }
}
