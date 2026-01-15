import { EMailProcessor, EMailProcessorList, ProcessingStartOn } from "../EMailProcessor";
import { SMLProcessor } from "./SMLProcessor";
import type { EMail } from "../EMail";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { Observable, notifyChangedProperty } from "../../util/Observable";
import { logError } from "../../../frontend/Util/error";
import { assert, type Json } from "../../util/util";
import type { Collection } from "svelte-collections";

export class SMLData extends Observable {
  /** `sml.@context`, normally `"https://schema.org"` */
  context: string;
  /** `sml.@type`, e.g. `"IceCreamShop"` ` */
  type: string;
  /** The complete SML JSON */
  @notifyChangedProperty
  sml: Json;

  toJSON(): Json {
    return this.sml;
  }
  fromJSON(json: Json): void {
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
    if (email.sml) {
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
    email.sml = data;

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
