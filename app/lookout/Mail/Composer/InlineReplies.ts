import type { EMail } from "../../../logic/Mail/EMail";
import type { ComposerCommands } from "./ComposerCommands";
import { DraftContent } from "./DraftContent";
import { MessageBox } from "../../Shared/Dialog/MessageBox";
import { inlineReplies, inlineRibbon } from "../Selected";
import { get } from "svelte/store";
import { gt } from "../../../l10n/l10n";

export class InlineReply {
  readonly original: EMail;
  readonly draft: EMail;
  isNew = true;

  constructor(original: EMail, draft: EMail) {
    this.original = original;
    this.draft = draft;
  }
}

export interface InlineRibbon {
  draft: EMail;
  commands: ComposerCommands;
}

export class InlineReplies {
  static async start(original: EMail, draft: EMail) {
    let existing = inlineReplies.find(reply => reply.original == original) ?? null;
    if (existing && DraftContent.hasUserText(existing.draft.html) &&
        !await MessageBox.ask(gt`Discard Draft`, gt`You already started a response to this message. Do you want to discard it and start a new one?`)) {
      return;
    }
    if (existing) {
      InlineReplies.remove(existing.draft);
    }
    inlineReplies.add(new InlineReply(original, draft));
  }

  static remove(draft: EMail) {
    let reply = inlineReplies.find(existing => existing.draft == draft);
    if (reply) {
      inlineReplies.remove(reply);
    }
    if (get(inlineRibbon)?.draft == draft) {
      inlineRibbon.set(null);
    }
  }
}
