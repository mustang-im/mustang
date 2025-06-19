import type { EMail } from "./EMail";
import { ArrayColl } from "svelte-collections";
import type PostalMime from "postal-mime";
import { AbstractFunction } from "../util/util";

export class EMailProcessorList {
  static processors = new ArrayColl<EMailProcessor>();

  static async runProcessors(step: ProcessingStartOn, email: EMail, mime?: PostalMime) {
    let processors = EMailProcessorList.processors.filterOnce(p => p.runOn == step);
    for (let processor of processors) {
      await processor.process(email, mime);
    }
  }
}

export class EMailProcessor {
  runOn: ProcessingStartOn;
  async process(email: EMail, mime?: PostalMime) {
    throw new AbstractFunction();
  }

  static hookup() {
    if (EMailProcessorList.processors.some(p => p instanceof this)) {
      return;
    }
    EMailProcessorList.processors.add(new this());
  }
  unhookup() {
    EMailProcessorList.processors.remove(this);
  }
}

export enum ProcessingStartOn {
  /** On every parsing, e.g. after download and after loading from database.
   * About once per email opening and app startup. */
  Parse = "parse",
  /** When a new mail arrives, before the spam filter checked it */
  BeforeSpamFilter = "before-spam-filter",
  SpamFilter = "spam-filter",
  FilterRules = "filter-rules",
  /** When a new mail arrives, after spam filter etc. */
  Incoming = "incoming",
  /** When the user sent an email. Acts on the outgoing emails. */
  Sent = "sent",
  /** When the user in the UI manually triggers the processing of the filters. */
  Manual = "manual",
}
