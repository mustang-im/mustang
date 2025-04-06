import type { EMail } from "./EMail";
import { ArrayColl } from "svelte-collections";
import { AbstractFunction } from "../util/util";
import type { Email as MIME} from "postal-mime";

export class EMailProcessorList {
  static processors = new ArrayColl<EMailProcessor>();
}

export class EMailProcessor {
  runOn: ProcessingStartOn;
  process(email: EMail, mime: MIME) {
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
  Parse = 1,
  BeforeSpamFilter = 2,
  NewMessage = 3,
  AfterFilterRules = 4,
  Sent = 5,
  Manual = 6,
}
