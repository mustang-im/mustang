export enum ComposerCommand {
  Send = "send",
  Save = "save",
  Link = "link",
  Find = "find",
  Replace = "replace",
}

export type ComposerKey = Pick<KeyboardEvent, "key" | "code" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey">;

export class ComposerShortcuts {
  static commandFor(event: ComposerKey): ComposerCommand | null {
    let ctrl = event.ctrlKey || event.metaKey;
    if (event.shiftKey) {
      return null;
    }
    if (ctrl && !event.altKey && event.key == "Enter") {
      return ComposerCommand.Send;
    }
    if (event.altKey && !ctrl && event.code == "KeyS") {
      return ComposerCommand.Send;
    }
    if (ctrl && !event.altKey && event.code == "KeyS") {
      return ComposerCommand.Save;
    }
    if (ctrl && !event.altKey && event.code == "KeyK") {
      return ComposerCommand.Link;
    }
    if (ctrl && !event.altKey && event.code == "KeyH") {
      return ComposerCommand.Replace;
    }
    if (!ctrl && !event.altKey && event.key == "F4") {
      return ComposerCommand.Find;
    }
    return null;
  }
}
