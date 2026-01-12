import { EMailProcessor, ProcessingStartOn } from "../EMailProcessor";
import type { EMail } from "../EMail";
import { NotReached } from "../../util/util";

/**
 * Subclasses are processors specific to a given SML data type.
 *
 * Interprets the SML JSON at email parse time,
 * extracts information from it,
 * and writes it into a database.
 *
 * Must be written so that it
 * a) only needs to be run once per email, and doesn't need to be re-run after every startup
 * b) can be re-run multiple times on the same email without duplicating data in the DB
 * c) is efficient
 *
 * If you only want to build a display UI and don't need to process data at email download,
 * then you don't need this. You only need `email.sml`.
 */
export abstract class SMLProcessor extends EMailProcessor {
  /** Only process SML of these data types.
   * You find it on @see https://schema.org/docs/full.html
   * You must set this to an array in your subclass.
   * E.g. `["Restaurant", "IceCreamShop, "Bakery"]` */
  abstract types: string[];
  /** The vocabulary registry of the `types`.
   * In most cases, this should be `"https://schema.org/"`. */
  abstract context: string;
  abstract processSML(email: EMail, sml: Object): Promise<void>;

  ProcessingStartOn = ProcessingStartOn.SML;
  async process(): Promise<never> {
    throw new NotReached();
  }
}
