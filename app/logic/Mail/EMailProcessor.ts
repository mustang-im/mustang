import type { EMail } from "./EMail";
import { ArrayColl } from "svelte-collections";
import type PostalMime from "postal-mime";
import { AbstractFunction } from "../util/util";

export class EMailProcessorList {
  static processors = new ArrayColl<EMailProcessor>();
}

export class EMailProcessor {
  runOn: ProcessingStartOn;
  async process(email: EMail, mime: PostalMime): Promise<void> {
    throw new AbstractFunction();
  }

  static hookup() {
    console.log("hookup", this.name);
    if (EMailProcessorList.processors.some(p => p instanceof this)) {
      return;
    }
    EMailProcessorList.processors.add(new this());
  }
  unhookup() {
    EMailProcessorList.processors.remove(this);
  }
}

/** For now, only Parse is supported */
export enum ProcessingStartOn {
  Parse = 1,
  BeforeSpamFilter = 2,
  NewMessage = 3,
  AfterFilterRules = 4,
  Sent = 5,
  Manual = 6,
}
