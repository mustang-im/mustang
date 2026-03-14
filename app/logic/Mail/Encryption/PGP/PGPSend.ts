import { SendEncrypted } from "../SendEncrypted";
import type { EMail } from "../../EMail";
import { CreateMIME } from "../../SMTP/CreateMIME";
import { PGPPublicKey } from "./PGPPublicKey";
import { PGPPrivateKey } from "./PGPPrivateKey";
import type { PersonUID } from "../../../Abstract/PersonUID";
import { NotReached, assert } from "../../../util/util";
import { gt } from "../../../../l10n/l10n";
import type OpenPGP from "openpgp";

export class PGPSend {
  /**
   * Called before sending email, if PGP is to be used.
   * Encrypts and signs the message, as requested.
   * The user must have a usable private key, otherwise mail throws.
   * If encryption is requested, all recipients must have usable public keys,
   * otherwise mail throws. The caller is responsible to ensure that.
   *
   * @returns a new email that is encrypted and/or signed.
   *   The original email is untouched.
   */
  static async encryptAndSign(mail: EMail): Promise<EMail> {
    let privateKeys = mail.identity.encryptionPrivateKeys.filterOnce(key => key instanceof PGPPrivateKey && !key.obsolete);
    assert(privateKeys.hasItems, gt`Please first set up PGP encryption for yourself, in Settings | Mail | Identity | Encryption`);
    let privateKey = (privateKeys.find(key => key.useToSign) ?? privateKeys.first) as PGPPrivateKey;
    let result = SendEncrypted.cloneEMail(mail);
    let originalMIME = await CreateMIME.getMIME(mail);
    let openPGP = await import("openpgp");
    let message = await openPGP.createMessage({ binary: originalMIME });
    let privateOpenPGPKey = await privateKey.openPGPPrivateKey();
    if (mail.shouldEncrypt) {
      let recipientKeys = mail.allRecipients().contents.flatMap(puid =>
        puid.findPerson()?.encryptionPublicKeys.contents.filter(key =>
          key instanceof PGPPublicKey && !key.obsolete) as PGPPublicKey[]);
      let recipientOpenPGPKeys: OpenPGP.PublicKey[] = [];
      for (let recipientKey of recipientKeys) {
        recipientOpenPGPKeys.push(await recipientKey.openPGPPublicKey(openPGP));
      }
      let encrypted = await openPGP.encrypt({
        message: message,
        signingKeys: privateOpenPGPKey,
        encryptionKeys: recipientOpenPGPKeys,
      });
      result.mime = PGPSend.createMIMEForEncrypted(mail, encrypted);
    } else if (mail.signed) {
      let signature = await openPGP.sign({
        message: message,
        signingKeys: privateOpenPGPKey,
        detached: true,
      });

      const inHeader = false;
      if (inHeader) {
        // <https://www.ietf.org/archive/id/draft-gallagher-email-unobtrusive-signatures-02.html>
      } else {
        result.mime = PGPSend.createMIMEForSigned(mail, originalMIME, signature);
      }
    } else {
      throw new NotReached();
    }
    return result;
  }

  static createMIMEForEncrypted(mail: EMail, encryptedMessage: string): Uint8Array {
    // RFC 3156 Sec 4 <https://www.rfc-editor.org/rfc/rfc3156>

    function esc(str: string): string {
      return str?.replace(/<>,/g, "") ?? ""; // TODO implement better
    }
    function recipient(p: PersonUID): string {
      if (p.name) {
        return esc(p.name) + " <" + esc(p.emailAddress) + ">";
      } else {
        return esc(p.emailAddress);
      }
    }

    let boundary = "----" + crypto.randomUUID().replace(/-/g, "");
    let mime = [
      `Content-Type: multipart/encrypted; protocol="application/pgp-encrypted";`,
      ` boundary="${boundary}"`,
      `From: ` + recipient(mail.from),
      `To: ` + mail.to.contents.map(p => recipient(p)),
      `CC: ` + mail.cc.contents.map(p => recipient(p)),
      `Subject: PGP encrypted message`,
      `MIME-Version: 1.0`,
      ``,
      `--${boundary}`,
      `Content-Type: application/pgp-encrypted`,
      `Content-Description: PGP/MIME version identification`,
      ``,
      `Version: 1`,
      ``,
      `--${boundary}`,
      `Content-Type: application/octet-stream; name="encrypted.asc"`,
      `Content-Disposition: inline; filename="encrypted.asc"`,
      `Content-Description: OpenPGP encrypted message`,
      ``,
      encryptedMessage,
      ``,
      `--${boundary}--`,
    ].join('\r\n');

    return new TextEncoder().encode(mime);
  }


  static createMIMEForSigned(mail: EMail, message: Uint8Array, signature: string): Uint8Array {
    // RFC 3156 Sec 5 <https://www.rfc-editor.org/rfc/rfc3156>

    function esc(str: string): string {
      return str?.replace(/<>,/g, "") ?? ""; // TODO implement better
    }
    function recipient(p: PersonUID): string {
      if (p.name) {
        return esc(p.name) + " <" + esc(p.emailAddress) + ">";
      } else {
        return esc(p.emailAddress);
      }
    }

    let boundary = "----=_Part_" + crypto.randomUUID().replace(/-/g, "");
    let mime = [
      `Content-Type: multipart/signed; protocol="application/pgp-signature"; micalg=pgp-sha512;`,
      ` boundary="${boundary}"`,
      `From: ` + recipient(mail.from),
      `To: ` + mail.to.contents.map(p => recipient(p)),
      `CC: ` + mail.cc.contents.map(p => recipient(p)),
      `Subject: ` + mail.subject,
      `MIME-Version: 1.0`,
      ``,
      `--${boundary}`,
      new TextDecoder().decode(message),
      ``,
      `--${boundary}`,
      `Content-Type: application/pgp-signature; name="signature.asc"`,
      `Content-Disposition: inline; filename="signature.asc"`,
      ``,
      signature,
      ``,
      `--${boundary}--`,
    ].join('\r\n');

    return new TextEncoder().encode(mime);
  }

  /* import { MimeNode } from "mime-model";
  static createMIMEForEncryptedViaMIMEModel(mail: EMail, encryptedMessage: Uint8Array): Uint8Array {
    let msg = MimeNode.create(
      `multipart/encrypted; protocol="application/pgp-encrypted"`,
      { defaultHeaders: true });
    function recipient(p: PersonUID): { name: string, address: string } {
      return { name: p.name, address: p.emailAddress };
    }
    msg.from = recipient(mail.from);
    msg.to = mail.to.contents.map(p => recipient(p));
    msg.cc = mail.cc.contents.map(p => recipient(p));
    msg.subject = "PGP encrypted message";

    // Part 1: version marker
    const versionNode = MimeNode.create(null);
    versionNode.setHeaders([
      `Content-Type: application/pgp-encrypted`,
      `Content-Description: PGP/MIME version identification`,
    ]);
    versionNode.content = Buffer.from(`Version: 1\r\n`);

    // Part 2: encrypted message
    const encryptedNode = MimeNode.create(null);
    encryptedNode.setHeaders([
      `Content-Type: application/octet-stream; name="encrypted.asc"`,
      `Content-Disposition: inline; filename="encrypted.asc"`,
      `Content-Description: OpenPGP encrypted message`,
    ]);
    encryptedNode.content = encryptedMessage;

    msg.appendChild(versionNode);
    msg.appendChild(encryptedNode);
    return msg.serialize()
  }*/
}
