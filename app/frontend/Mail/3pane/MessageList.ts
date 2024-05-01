import { selectedMessage, selectedMessages } from "../Selected";
import { get } from "svelte/store";

export async function onKeyOnList(event: KeyboardEvent) {
  let selectedMessagesColl = get(selectedMessages)
  /** Important to use normal static array here. If were were to use `selectedMessages` Collection,
   * it would observe changes to selection even in the future and keep triggering
   * the action for all future selections. */
  let messages = selectedMessagesColl.contents;
  if (!messages.length) {
    return;
  }
  let message = get(selectedMessage) ?? messages[0];
  if (!event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
    if (event.key == "m") {
      event.stopPropagation();
      let isRead = message.isRead;
      await Promise.allSettled(messages.map(msg =>
        msg.markRead(!isRead)));
      return;
    } else if (event.key == "s") {
      event.stopPropagation();
      let isStarred = message.isStarred;
      await Promise.allSettled(messages.map(msg =>
        msg.markStarred(isStarred)));
      return;
    } else if (event.key == "j") {
      event.stopPropagation();
      selectedMessagesColl.clear();
      selectedMessagesColl.add(message.nextMessage(false));
      await Promise.allSettled(messages.map(async msg => {
        await msg.markSpam();
        await msg.deleteMessage();
      }));
      return;
    } else if (event.key == "Delete") {
      event.stopPropagation();
      selectedMessagesColl.clear();
      selectedMessagesColl.add(message.nextMessage(false));
      await Promise.allSettled(messages.map(msg =>
        msg.deleteMessage()));
      return;
    }
  }
}
