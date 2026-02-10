import { EMailProcessor, ProcessingStartOn } from "../EMailProcessor";
import type { EMail } from "../EMail";
import { NotReached } from "../../util/util";

/**
 * Subclasses are processors specific to a given email sender and data type.
 *
 * Interprets the HTML DOM at email parse time,
 * extracts information from it,
 * and writes it into a database.
 *
 * Must be written so that it
 * a) only needs to be run once per email, and doesn't need to be re-run after every startup
 * b) can be re-run multiple times on the same email without duplicating data in the DB
 * c) is efficient
 */
export abstract class HTMLDataProcessor extends EMailProcessor {
  /** Only process emails that come from these domains.
   * You must set this to an array in your subclass.
   * E.g. `["amazon.com", "amazon.de"]`, or
   * `["*"]` for all domains. */
  abstract fromDomains: string[];
  abstract processDOM(email: EMail, doc: Document): Promise<void>;

  ProcessingStartOn = ProcessingStartOn.HTMLDOM;
  async process(): Promise<never> {
    throw new NotReached();
  }
}
