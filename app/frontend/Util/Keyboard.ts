import { getOSName } from "./util";

export class Keyboard {
  static isCtrl(event: KeyboardEvent): boolean {
    return event.ctrlKey || event.metaKey;
  }

  static isTextField(target: EventTarget | null): boolean {
    let element = target as HTMLElement;
    return !!element?.closest?.("input, textarea, select, [contenteditable]:not([contenteditable='false'])");
  }

  static isMac(): boolean {
    return getOSName() == "macintosh";
  }

  static digit(event: KeyboardEvent): number | null {
    let digit = /^(Digit|Numpad)(\d)$/.exec(event.code)?.[2];
    return digit ? parseInt(digit) : null;
  }

  static consume(event: KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
  }
}
