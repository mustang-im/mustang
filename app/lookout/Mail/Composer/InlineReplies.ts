import type { EMail } from "../../../logic/Mail/EMail";
import type { ComposerCommands } from "./ComposerCommands";
import { DraftContent } from "./DraftContent";
import { MessageBox } from "../../Shared/Dialog/MessageBox";
import { ArrayColl } from "svelte-collections";
import { get, writable, type Writable } from "svelte/store";
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
  static readonly replies = new ArrayColl<InlineReply>();
  static readonly ribbon: Writable<InlineRibbon | null> = writable(null);

  static replyFor(original: EMail | null): InlineReply | null {
    if (!original) {
      return null;
    }
    return InlineReplies.replies.find(reply => reply.original == original) ?? null;
  }

  static hasReply(original: EMail | null): boolean {
    return !!InlineReplies.replyFor(original);
  }

  static async start(original: EMail, draft: EMail) {
    let existing = InlineReplies.replyFor(original);
    if (existing && DraftContent.hasUserText(existing.draft.html) &&
        !await MessageBox.ask(gt`Discard Draft`, gt`You already started a response to this message. Do you want to discard it and start a new one?`)) {
      return;
    }
    if (existing) {
      InlineReplies.remove(existing.draft);
    }
    InlineReplies.replies.add(new InlineReply(original, draft));
  }

  static remove(draft: EMail) {
    let reply = InlineReplies.replies.find(existing => existing.draft == draft);
    if (reply) {
      InlineReplies.replies.remove(reply);
    }
    InlineReplies.hideRibbon(draft);
  }

  static showRibbon(draft: EMail, commands: ComposerCommands) {
    InlineReplies.ribbon.set({ draft, commands });
  }

  static hideRibbon(draft: EMail) {
    if (get(InlineReplies.ribbon)?.draft == draft) {
      InlineReplies.ribbon.set(null);
    }
  }
}
