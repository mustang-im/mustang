import type { EMail } from "../../../logic/Mail/EMail";
import type { Folder } from "../../../logic/Mail/Folder";
import { selectedMessage } from "../Selected";
import { ArrayColl } from "svelte-collections";
import { get } from "svelte/store";

export function onDragStartMail(event: DragEvent, message: EMail) {
  selectedMessage.set(message);
  event.dataTransfer.setData("message/drag-id", message.id);
  event.dataTransfer.effectAllowed = "copyMove";
  let icon = new Image();
  icon.src = "icon/mails.png"; // TODO Loads too late
  event.dataTransfer.setDragImage(icon, -16, -16);
}

export async function onDropMail(event: DragEvent, folder: Folder) {
  event.preventDefault();
  let msg = get(selectedMessage);
  let msgID = event.dataTransfer.getData("message/drag-id");
  if (!msg || msg.id != msgID) {
    return;
  }
  let msgs = new ArrayColl<EMail>();
  msgs.add(msg);
  let action = event.dataTransfer.dropEffect;
  if (action == "copy") {
    await folder.copyMessagesHere(msgs);
  } else {
    await folder.moveMessagesHere(msgs);
  }
}

export async function onDragOverMail(event: DragEvent, folder: Folder) {
  event.preventDefault();
}
