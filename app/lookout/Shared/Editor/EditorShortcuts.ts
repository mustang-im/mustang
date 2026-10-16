import { EditorTool } from "./EditorCommands";

export type ShortcutKey = Pick<KeyboardEvent, "key" | "code" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey">;

export class EditorShortcuts {
  static toolFor(event: ShortcutKey): EditorTool | null {
    let ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey || event.altKey) {
      return null;
    }
    if (ctrl && event.code == "KeyK") {
      return EditorTool.Link;
    }
    if (ctrl && event.code == "KeyH") {
      return EditorTool.Replace;
    }
    if (!ctrl && event.key == "F4") {
      return EditorTool.Find;
    }
    return null;
  }
}
