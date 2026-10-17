import type { Addressbook } from "../../logic/Contacts/Addressbook";
import { ContactsActions } from "./ContactsActions";
import { GlobalKeyboard } from "../MainWindow/GlobalKeyboard";
import { Keyboard } from "../Util/Keyboard";

export enum ContactsKeyAction {
  NewContact = "new-contact",
  Search = "search",
}

export class ContactsKeyboard {
  static onKey(event: KeyboardEvent, addressbook: Addressbook | null) {
    if (event.defaultPrevented || Keyboard.isTextField(event.target)) {
      return;
    }
    let action = ContactsKeyboard.actionFor(event);
    if (!action) {
      return;
    }
    Keyboard.consume(event);
    if (action == ContactsKeyAction.NewContact) {
      ContactsActions.newPerson(addressbook);
    } else if (action == ContactsKeyAction.Search) {
      GlobalKeyboard.focusSearch();
    }
  }

  static actionFor(event: KeyboardEvent): ContactsKeyAction | null {
    if (!Keyboard.isCtrl(event) || event.altKey || event.shiftKey) {
      return null;
    }
    let key = event.key.toLowerCase();
    if (key == "n") {
      return ContactsKeyAction.NewContact;
    } else if (key == "e") {
      return ContactsKeyAction.Search;
    }
    return null;
  }
}
