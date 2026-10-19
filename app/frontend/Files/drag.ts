import type { File } from "../../logic/Files/File";
import type { Directory } from "../../logic/Files/Directory";
import { selectedFile, selectedFiles } from "./selected";
import { assert } from "../../logic/util/util";
import { gt } from "../../l10n/l10n";
import { ArrayColl } from "svelte-collections";
import { get } from "svelte/store";

export function onDragStartFile(event: DragEvent, file: File) {
  selectedFile.set(file);
  let files = get(selectedFiles);
  if (files.contains(file)) {
    event.dataTransfer.setData("message/drag-ids", files.contents.map(f => f.id).join(","));
  } else {
    event.dataTransfer.setData("message/drag-ids", file.id);
  }
  event.dataTransfer.effectAllowed = "copyMove";
  let icon = new Image();
  icon.src = "icon/mails.png"; // TODO Loads too late
  event.dataTransfer.setDragImage(icon, 8, 8);
}

export async function onDropFile(event: DragEvent, folder: Directory) {
  event.preventDefault();
  let file = get(selectedFile);
  let fileIDsStr = event.dataTransfer.getData("file/drag-ids");
  if (!file || !fileIDsStr) {
    return;
  }
  let fileIDs = fileIDsStr.split(",");
  let messages = get(selectedFiles).contents;
  if (fileIDs.length == 0) {
    return;
  } else if (fileIDs.length == 1) {
    assert(fileIDs[0] == file.id, gt`Drag&drop failed: Selected file ID doesn't match the drag data`);
    messages = [ file ];
  } else {
    assert(messages.every(msg => fileIDs.includes(msg.id)), gt`Drag&drop failed: Selected file IDs don't match the drag data`);
  }
  if (event.ctrlKey || event.metaKey) {
    await folder.copyFilesHere(new ArrayColl(messages));
  } else {
    await folder.moveFilesHere(new ArrayColl(messages));
  }
}

export async function onDragOverFile(event: DragEvent, folder: Directory) {
  event.preventDefault();
  if (event.ctrlKey || event.metaKey) {
    event.dataTransfer.dropEffect = "copy";
  }
}
