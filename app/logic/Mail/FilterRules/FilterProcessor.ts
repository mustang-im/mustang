import type { EMail } from "../../Mail/EMail";
import { EMailProcessor, EMailProcessorList, ProcessingStartOn } from "../../Mail/EMailProccessor";

/**
 * Runs filters, spam filter, and content interpreters on the message.
 *
 * `NewMessage` is called after the entire message has been downloaded,
 * and before it is stored.
 */
export class FilterProcessor extends EMailProcessor {
  runOn = ProcessingStartOn.FilterRules;
  async process(email: EMail) {
    let rules = email.folder?.account?.filterRuleActions.filterOnce(rule => rule.when == this.runOn);
    for (let rule of rules) {
      await rule.run(email);
    }
  }
}

/** Call once on startup */
export function addFilterProcessors() {
  for (let runOn of Object.values(ProcessingStartOn)) {
    let processor = new FilterProcessor();
    processor.runOn = runOn;
    EMailProcessorList.processors.add(processor);
  }
}
