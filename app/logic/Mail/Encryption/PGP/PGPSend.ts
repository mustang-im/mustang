import { SendEncrypted } from "../SendEncrypted";
import type { EMail } from "../../EMail";
import { CreateMIME } from "../../SMTP/CreateMIME";
import { PGPPublicKey } from "./PGPPublicKey";
import { PGPPrivateKey } from "./PGPPrivateKey";
import { sendAutoCryptHeader } from "./AutoCrypt";
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
      recipientOpenPGPKeys.push(await privateKey.openPGPPublicKey(openPGP));
      let encrypted = await openPGP.encrypt({
        message: message,
        signingKeys: privateOpenPGPKey,
        encryptionKeys: recipientOpenPGPKeys,
      });
      result.sendRawMIME = PGPSend.createMIMEForEncrypted(mail, encrypted, privateKey);
    } else if (mail.signed) {
      let signature = await openPGP.sign({
        message: message,
        signingKeys: privateOpenPGPKey,
        detached: true,
      });

      let originalMIMEStr = new TextDecoder().decode(originalMIME).trim().replace(/User-Agent: [^\r]+\r\n/, "");
      const inHeader = false;
      if (inHeader) {
        result.sendRawMIME = PGPSend.createMIMEForSignedInHeader(mail, originalMIMEStr, signature, privateKey);
      } else {
        result.sendRawMIME = PGPSend.createMIMEForSignedDetached(mail, originalMIMEStr, signature, privateKey);
      }
    } else {
      throw new NotReached();
    }
    return result;
  }

  static createMIMEHeader(mail: EMail, privateKey: PGPPrivateKey): string[] {
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

    return [
      `MIME-Version: 1.0`,
      `From: ` + recipient(mail.from),
      `To: ` + mail.to.contents.map(p => recipient(p)),
      `CC: ` + mail.cc.contents.map(p => recipient(p)),
      ...this.wrapHeader(sendAutoCryptHeader(mail.identity, privateKey)),
    ];
  }

  static createMIMEForEncrypted(mail: EMail, encryptedMessage: string, privateKey: PGPPrivateKey): string {
    // RFC 3156 Sec 4 <https://www.rfc-editor.org/rfc/rfc3156>
    let boundary = "----" + crypto.randomUUID().replace(/-/g, "");
    let mime = [
      ...PGPSend.createMIMEHeader(mail, privateKey),
      `Subject: PGP encrypted message`,
      `Content-Type: multipart/encrypted; protocol="application/pgp-encrypted";`,
      ` boundary="${boundary}"`,
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
    return mime;
  }

  static createMIMEForSignedDetached(mail: EMail, message: string, signature: string, privateKey: PGPPrivateKey): string {
    // RFC 3156 Sec 5 <https://www.rfc-editor.org/rfc/rfc3156>
    let boundary = "----" + crypto.randomUUID().replace(/-/g, "");
    let mime = [
      ...PGPSend.createMIMEHeader(mail, privateKey),
      ...this.wrapHeader(`Subject: ` + mail.subject),
      `Content-Type: multipart/signed; protocol="application/pgp-signature"; micalg=pgp-sha512;`,
      ` boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      message,
      ``,
      `--${boundary}`,
      `Content-Type: application/pgp-signature; name="signature.asc"`,
      `Content-Disposition: inline; filename="signature.asc"`,
      ``,
      signature,
      ``,
      `--${boundary}--`,
    ].join('\r\n');
    return mime;
  }

  static createMIMEForSignedInHeader(mail: EMail, message: Uint8Array, signature: string, privateKey: PGPPrivateKey): string {
    // <https://www.ietf.org/archive/id/draft-gallagher-email-unobtrusive-signatures-02.html#name-sig-header-field>
    let boundary = "----" + crypto.randomUUID().replace(/-/g, "");
    let mime = [
      ...PGPSend.createMIMEHeader(mail, privateKey),
      ...this.wrapHeader(`Subject: ` + mail.subject),
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      ...this.wrapHeader(`Sig: t=p; b=` + btoa(signature)),
      message,
      ``,
      `--${boundary}--`,
    ].join('\r\n');
    return mime;
  }

  protected static wrapHeader(content: string): string[] {
    const maxWidth = 60;
    let lines: string[] = [];
    for (let i = 0; i < content.length; i += maxWidth) {
      lines.push((i == 0 ? "" : "    ") + content.slice(i, i + maxWidth));
    }
    return lines;
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
