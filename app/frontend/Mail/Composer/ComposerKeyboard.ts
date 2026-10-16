import { Keyboard } from "../../Util/Keyboard";

export enum ComposerKeyAction {
  Send = "send",
  SaveDraft = "save-draft",
}

export class ComposerKeyboard {
  static actionFor(event: KeyboardEvent, isMac = Keyboard.isMac()): ComposerKeyAction | null {
    let ctrl = Keyboard.isCtrl(event);
    if (ctrl && !event.altKey && !event.shiftKey) {
      if (event.key == "Enter") {
        return ComposerKeyAction.Send;
      } else if (event.key.toLowerCase() == "s") {
        return ComposerKeyAction.SaveDraft;
      }
    } else if (event.altKey && !ctrl && !event.shiftKey && !isMac && event.code == "KeyS") {
      return ComposerKeyAction.Send;
    }
    return null;
  }
}
