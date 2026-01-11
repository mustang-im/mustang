import { EMailProcessor, EMailProcessorList, ProcessingStartOn } from "../EMailProcessor";
import { SMLProcessor } from "./SMLProcessor";
import type { EMail } from "../EMail";
import { ExtraData } from "../ExtraData";
import { logError } from "../../../frontend/Util/error";
import { assert } from "../../util/util";
import type { Collection } from "svelte-collections";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class SMLData extends ExtraData {
  static extraDataName: string = "sml";
  /** `sml.@context`, normally `"https://schema.org"` */
  context!: string;
  /** `sml.@type`, e.g. `"IceCreamShop"` ` */
  type!: string;
  /** The complete SML JSON */
  sml!: Object;

  toJSON(): Object {
    return this.sml;
  }
  fromJSON(json: Object): void {
    this.context = sanitize.nonemptystring(json["@context"]);
    this.type = sanitize.nonemptystring(json["@type"]);
    this.sml = json;
  }
}

/**
 * Reads the SML JSON at email parse time,
 * and calls all applicable `SMLProcessor`s.
 */
export abstract class SMLParseProcessor extends EMailProcessor {
  runOn = ProcessingStartOn.Parse;
  async process(email: EMail): Promise<void> {
    if (email.extraData.has(SMLData.extraDataName)) {
      return;
    }

    // TODO full vs. partial vs. non representation
    let attachment = email.attachments.find(a => a.mimeType == "application/ld+json");
    if (!attachment) {
      return;
    }
    assert(attachment.content, "Need SML attachment content to be loaded");
    let ldStr = await attachment.content.text();
    let sml = JSON.parse(ldStr);

    let data = new SMLData();
    data.context = sml["@context"];
    data.type = sml["@type"];
    data.sml = sml;
    email.extraData.set(SMLData.extraDataName, data);

    let processors = EMailProcessorList.processors.filterOnce(p => p instanceof SMLProcessor) as Collection<SMLProcessor>;
    if (processors.hasItems) {
      for (let processor of processors) {
        if (!(processor.context == data.context && processor.types.includes(data.type))) {
          continue;
        }
        processor.processSML(email, sml)
          .catch(logError);
      }
    }
  }
}
