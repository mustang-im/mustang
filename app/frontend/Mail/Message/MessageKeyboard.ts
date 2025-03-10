import { selectedMessage, selectedMessages } from "../Selected";
import { get } from "svelte/store";

// <https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values>

export async function onKeyOnList(event: KeyboardEvent) {
  let selectedMessagesColl = get(selectedMessages);
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
      let isRead = majority(messages, msg => msg.isRead);
      await Promise.allSettled(messages.map(msg =>
        msg.markRead(!isRead)));
      return;
    } else if (event.key == "s") {
      event.stopPropagation();
      let isStarred = majority(messages, msg => msg.isStarred);
      await Promise.allSettled(messages.map(msg =>
        msg.markStarred(!isStarred)));
      return;
    } else if (event.key == "j") {
      event.stopPropagation();
      selectedMessagesColl.clear();
      selectedMessagesColl.add(message.action.nextMessage(false));
      await Promise.allSettled(messages.map(msg =>
        msg.treatSpam()));
      return;
    } else if (event.key == "Delete") {
      event.stopPropagation();
      selectedMessagesColl.clear();
      selectedMessagesColl.add(message.action.nextMessage(false));
      await Promise.allSettled(messages.map(msg =>
        msg.deleteMessage()));
      return;
    }
  }
}

export async function onKeyOnMessage(event: KeyboardEvent) {
  onKeyOnList(event);

  let message = get(selectedMessage);
  let selectedMessagesColl = get(selectedMessages);
  if (!event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
    if (event.key == "ArrowDown" || event.key == "ArrowUp") {
      event.stopPropagation();
      let next = message.action.nextMessage(event.key == "ArrowUp");
      if (!next) {
        return;
      }
      selectedMessagesColl.clear();
      selectedMessagesColl.add(next);
      return;
    }
    /*
    if (event.key == "m") {
      event.stopPropagation();
      let isRead = message.isRead;
      await message.markRead(!isRead);
      return;
    } else if (event.key == "s") {
      event.stopPropagation();
      let isStarred = message.isStarred;
      await message.markStarred(!isStarred);
      return;
    } else if (event.key == "j") {
      event.stopPropagation();
      selectedMessagesColl.clear();
      selectedMessagesColl.add(message.action.nextMessage(false));
      await message.treatSpam();
      return;
    } else if (event.key == "Delete") {
      event.stopPropagation();
      selectedMessagesColl.clear();
      selectedMessagesColl.add(message.action.nextMessage(false));
      await message.deleteMessage();
      return;
    }
    */
  }
}

function majority<T>(array: Array<T>, condition: (item: T) => boolean): boolean {
  return array.filter(condition).length / array.length > 0.5;
}
