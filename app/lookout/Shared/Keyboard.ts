import { getOSName } from "../../frontend/Util/util";

export class Keyboard {
  static readonly isMac = getOSName() == "macintosh";

  static isTextField(target: EventTarget | null): boolean {
    let element = target as HTMLElement;
    return !!element?.closest?.("input, textarea, select, [contenteditable]:not([contenteditable=false])");
  }

  static isEditor(target: EventTarget | null): boolean {
    let element = target as HTMLElement;
    return !!element?.closest?.("[contenteditable]:not([contenteditable=false])");
  }
}
