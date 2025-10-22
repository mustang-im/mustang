import { EMailProcessor, ProcessingStartOn } from "../EMailProcessor";
import type { EMail } from "../EMail";
import { getDomainForEmailAddress } from "../../util/netUtil";
import { assert } from "../../util/util";

/**
 * Reads the HTML DOM at email parse time,
 * extracts information from the email,
 * and writes it into a database.
 *
 * Must be written so that it
 * a) doesn't need to be re-run after every startup
 * b) can be re-run multiple times without duplicating data in the DB
 * c) is efficient
 */
export abstract class HTMLDataProcessor extends EMailProcessor {
  runOn = ProcessingStartOn.Parse;
  /** Only process emails that come from these domains.
   * You must set this to an array in your subclass.
   * E.g. `["amazon.com", "amazon.de"]`, or
   * `["*"]` for all domains. */
  abstract fromDomains: string[];
  async process(email: EMail): Promise<void> {
    console.log("checking email", email.subject);
    if (!email.hasHTML) {
      return;
    }
    assert(this.fromDomains?.length, "Please set fromDomains");
    if (this.fromDomains[0] != "*") {
      let fromDomain = getDomainForEmailAddress(email.from?.emailAddress);
      if (!this.fromDomains.includes(fromDomain)) {
        return;
      }
    }

    /* Cache DOM, in case we need to be running 50 processors in a row.
      But all processors run in parallel, so this caching code won't work.
    let emailPrivate = email as any;
    let dom = emailPrivate._dom ?? (emailPrivate._dom = new DOMParser(...)) */

    let dom = new DOMParser().parseFromString(email.html, "text/html");
    await this.processDOM(dom, email);
  }
  abstract processDOM(doc: Document, email: EMail): Promise<void>;
}
