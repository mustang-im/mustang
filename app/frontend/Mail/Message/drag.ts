import type { EMail } from "../../../logic/Mail/EMail";
import type { Folder } from "../../../logic/Mail/Folder";
import { selectedMessage, selectedMessages } from "../Selected";
import { ArrayColl } from "svelte-collections";
import { get } from "svelte/store";
import { assert } from "../../../logic/util/util";

export function onDragStartMail(event: DragEvent, message: EMail) {
  selectedMessage.set(message);
  let messages = get(selectedMessages);
  if (messages.contains(message)) {
    event.dataTransfer.setData("message/drag-ids", messages.contents.map(msg => msg.id).join(","));
  } else {
    event.dataTransfer.setData("message/drag-ids", message.id);
  }
  event.dataTransfer.effectAllowed = "copyMove";
  let icon = new Image();
  icon.src = "icon/mails.png"; // TODO Loads too late
  event.dataTransfer.setDragImage(icon, -16, -16);
}

export async function onDropMail(event: DragEvent, folder: Folder) {
  event.preventDefault();
  let message = get(selectedMessage);
  let msgIDsStr = event.dataTransfer.getData("message/drag-ids");
  if (!message || !msgIDsStr) {
    return;
  }
  let msgIDs = msgIDsStr.split(",");
  let messages = get(selectedMessages).contents;
  if (msgIDs.length == 0) {
    return;
  } else if (msgIDs.length == 1) {
    assert(msgIDs[0] == message.id, "Drag&drop failed: Selected message ID doesn't match the drag data");
    messages = [ message ];
  } else {
    assert(messages.every(msg => msgIDs.includes(msg.id)), "Drag&drop failed: Selected message IDs don't match the drag data");
  }
  if (event.ctrlKey || event.metaKey) {
    await folder.copyMessagesHere(new ArrayColl(messages));
  } else {
    await folder.moveMessagesHere(new ArrayColl(messages));
  }
}

export async function onDragOverMail(event: DragEvent, folder: Folder) {
  event.preventDefault();
  if (event.ctrlKey || event.metaKey) {
    event.dataTransfer.dropEffect = "copy";
  }
}
