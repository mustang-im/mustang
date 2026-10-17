import type { ShortcutKey } from "../../Shared/Editor/EditorShortcuts";
import { Keyboard } from "../../Util/keyboard";

export enum ComposerCommand {
  Send = "send",
  Save = "save",
}

export type ComposerKey = ShortcutKey;

export class ComposerShortcuts {
  static commandFor(event: ComposerKey, isMac = Keyboard.isMac): ComposerCommand | null {
    let ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey) {
      return null;
    }
    if (ctrl && !event.altKey && event.key == "Enter") {
      return ComposerCommand.Send;
    }
    if (event.altKey && !ctrl && event.code == "KeyS" && !isMac) {
      return ComposerCommand.Send;
    }
    if (ctrl && !event.altKey && event.code == "KeyS") {
      return ComposerCommand.Save;
    }
    return null;
  }
}
