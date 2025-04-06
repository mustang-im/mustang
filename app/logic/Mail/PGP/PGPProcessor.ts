import { EMailProcessor, ProcessingStartOn } from "../../Mail/EMailProccessor";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { EMail } from "../EMail";
import * as openpgp from "openpgp";
import type { Email as MIME} from "postal-mime";

export class PGPProcessor extends EMailProcessor {
  runOn = ProcessingStartOn.Parse;
  async process(email: EMail, mime: MIME) {
    let sign = email.attachments.find(a => a.mimeType == "application/pgp-signed")?.content;
    let encrypted = email.attachments.find(a => a.mimeType == "application/pgp-encrypted")?.content;
    if (encrypted) {
      let decrypted = await openpgp.decrypt(encrypted)
      return;
    }

  }

  async certificateMatchesEmail(emailAddress: string): boolean {

  }
}
