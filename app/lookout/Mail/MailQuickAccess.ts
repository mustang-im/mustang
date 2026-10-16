import type { EMail } from "../../logic/Mail/EMail";
import type { QuickAccessCommand } from "../Shared/QuickAccess/QuickAccess";
import { selectedMessages } from "../../frontend/Mail/Selected";
import { MessageActions } from "./MessageActions";
import { derived, get, readable, type Readable } from "svelte/store";
import SendReceiveIcon from "lucide-svelte/icons/refresh-cw";
import ReplyIcon from "lucide-svelte/icons/reply";
import ReplyAllIcon from "lucide-svelte/icons/reply-all";
import ForwardIcon from "lucide-svelte/icons/forward";
import DeleteIcon from "lucide-svelte/icons/trash-2";
import PrintIcon from "lucide-svelte/icons/printer";
import { gt } from "../../l10n/l10n";

export class MailQuickAccess {
  static readonly sendReceiveAll: QuickAccessCommand = {
    id: "sendReceiveAll",
    label: gt`Send/Receive All Folders`,
    icon: SendReceiveIcon,
    shortCutInfo: "F9",
    shownByDefault: true,
    run: () => MessageActions.sendReceiveAll(),
  };

  static commands(): QuickAccessCommand[] {
    let selection = MailQuickAccess.selection();
    let noSelection = derived(selection, messages => !messages.length && gt`Select a message first`);
    let noSingle = derived(selection, messages => messages.length != 1 && gt`Select one message first`);
    let single = () => get(selection)[0];
    return [
      MailQuickAccess.sendReceiveAll,
      { id: "mail.reply", label: gt`Reply`, icon: ReplyIcon, shortCutInfo: "Ctrl+R", disabled: noSingle,
        run: () => MessageActions.reply(single()) },
      { id: "mail.replyAll", label: gt`Reply All`, icon: ReplyAllIcon, shortCutInfo: "Ctrl+Shift+R", disabled: noSingle,
        run: () => MessageActions.replyAll(single()) },
      { id: "mail.forward", label: gt`Forward`, icon: ForwardIcon, shortCutInfo: "Ctrl+F", disabled: noSingle,
        run: () => MessageActions.forward(single()) },
      { id: "mail.delete", label: gt`Delete`, icon: DeleteIcon, shortCutInfo: "Del", disabled: noSelection,
        run: () => MessageActions.delete(get(selection)) },
      { id: "mail.print", label: gt`Print`, icon: PrintIcon, shortCutInfo: "Ctrl+P", disabled: noSingle,
        run: () => MessageActions.print(single()) },
    ];
  }

  protected static selection(): Readable<EMail[]> {
    return readable<EMail[]>([], set => {
      let unsubscribeMessages: () => void = null;
      let unsubscribeSelection = selectedMessages.subscribe(messages => {
        unsubscribeMessages?.();
        unsubscribeMessages = null;
        if (!messages) {
          set([]);
          return;
        }
        unsubscribeMessages = messages.subscribe(() => set(messages.contents));
      });
      return () => {
        unsubscribeMessages?.();
        unsubscribeSelection();
      };
    });
  }
}
