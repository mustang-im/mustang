import type { File } from "../../logic/Files/File";
import type { Directory } from "../../logic/Files/Directory";
import { getFilesSelection } from "./selected";
import type { AppWindow } from "../MainWindow/AppWindow";
import { assert } from "../../logic/util/util";
import { gt } from "../../l10n/l10n";
import { ArrayColl } from "svelte-collections";
import { get } from "svelte/store";

/** The files that the user drags right now. They may be dropped into another window. */
let draggedFiles: File[] = [];

export function onDragStartFile(event: DragEvent, file: File, appWindow: AppWindow) {
  let { selectedFile, selectedFiles } = getFilesSelection(appWindow);
  selectedFile.set(file);
  let files = get(selectedFiles);
  draggedFiles = files.contains(file) ? files.contents as File[] : [ file ];
  event.dataTransfer.setData("message/drag-ids", draggedFiles.map(f => f.id).join(","));
  event.dataTransfer.effectAllowed = "copyMove";
  let icon = new Image();
  icon.src = "icon/mails.png"; // TODO Loads too late
  event.dataTransfer.setDragImage(icon, 8, 8);
}

export async function onDropFile(event: DragEvent, folder: Directory) {
  event.preventDefault();
  let messages = draggedFiles;
  let fileIDsStr = event.dataTransfer.getData("file/drag-ids");
  if (!messages.length || !fileIDsStr) {
    return;
  }
  let fileIDs = fileIDsStr.split(",");
  assert(fileIDs.length == messages.length && messages.every(msg => fileIDs.includes(msg.id)), gt`Drag&drop failed: Selected file IDs don't match the drag data`);
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
