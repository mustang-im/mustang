import { Keyboard } from "../Shared/Keyboard";

export enum GlobalKeyAction {
  Mail = "mail",
  Calendar = "calendar",
  People = "people",
  NewMail = "new-mail",
  NewAppointment = "new-appointment",
  NewMeeting = "new-meeting",
  NewContact = "new-contact",
  NewContactGroup = "new-contact-group",
  AddressBook = "address-book",
  Search = "search",
  TellMe = "tell-me",
  CollapseRibbon = "collapse-ribbon",
}

export interface GlobalKeyPress {
  key: string;
  code?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

export class GlobalKeys {
  static actionFor(press: GlobalKeyPress, isMac = Keyboard.isMac): GlobalKeyAction | null {
    let ctrl = !!(press.ctrlKey || press.metaKey);
    let shift = !!press.shiftKey;
    let alt = !!press.altKey;
    let key = press.key?.length == 1 ? press.key.toLowerCase() : press.key;
    let digit = /^(?:Digit|Numpad)(\d)$/.exec(press.code ?? "")?.[1];
    if (ctrl && !shift && !alt) {
      const kModules: Record<string, GlobalKeyAction> = {
        "1": GlobalKeyAction.Mail,
        "2": GlobalKeyAction.Calendar,
        "3": GlobalKeyAction.People,
        "4": GlobalKeyAction.People,
      };
      if (digit) {
        return kModules[digit] ?? null;
      }
      switch (key) {
        case "e": return GlobalKeyAction.Search;
        case "F1": return GlobalKeyAction.CollapseRibbon;
      }
      return null;
    }
    if (ctrl && shift && !alt) {
      switch (key) {
        case "m": return GlobalKeyAction.NewMail;
        case "a": return GlobalKeyAction.NewAppointment;
        case "q": return GlobalKeyAction.NewMeeting;
        case "c": return GlobalKeyAction.NewContact;
        case "l": return GlobalKeyAction.NewContactGroup;
        case "b": return GlobalKeyAction.AddressBook;
      }
      return null;
    }
    if (alt && !ctrl && !shift && press.code == "KeyQ" && !isMac) {
      return GlobalKeyAction.TellMe;
    }
    if (!ctrl && !shift && !alt && key == "F3") {
      return GlobalKeyAction.Search;
    }
    return null;
  }
}
