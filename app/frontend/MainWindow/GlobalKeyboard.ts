import type { MustangApp } from "../AppsBar/MustangApp";
import { openApp } from "../AppsBar/selectedApp";
import { mailMustangApp } from "../Mail/MailMustangApp";
import { calendarMustangApp } from "../Calendar/CalendarMustangApp";
import { contactsMustangApp } from "../Contacts/ContactsMustangApp";
import { selectedAccount } from "../Mail/Selected";
import { selectedCalendar, selectedDate } from "../Calendar/selected";
import { createNewEvent } from "../Calendar/event";
import { ContactsActions } from "../Contacts/ContactsActions";
import { Keyboard } from "../Util/Keyboard";
import { appGlobal } from "../../logic/app";
import { webMail } from "../../logic/build";
import { assert } from "../../logic/util/util";
import { gt } from "../../l10n/l10n";
import { get } from "svelte/store";

export enum GlobalKeyAction {
  Mail = "mail",
  Calendar = "calendar",
  People = "people",
  NewMail = "new-mail",
  NewEvent = "new-event",
  NewContact = "new-contact",
  AddressBook = "address-book",
  Search = "search",
}

export class GlobalKeyboard {
  static async onKey(event: KeyboardEvent) {
    if (event.defaultPrevented) {
      return;
    }
    let action = GlobalKeyboard.actionFor(event);
    if (!action) {
      return;
    }
    Keyboard.consume(event);
    await GlobalKeyboard.run(action);
  }

  /** Outlook's keys. In a browser, Ctrl+1 etc. switch tabs, so the web build uses Ctrl+Shift+1 etc., like Outlook on the web. */
  static actionFor(event: KeyboardEvent, isWebMail = webMail, isMac = Keyboard.isMac()): GlobalKeyAction | null {
    let ctrl = Keyboard.isCtrl(event);
    let digit = Keyboard.digit(event);
    if (ctrl && !event.altKey && digit && event.shiftKey == isWebMail) {
      const kApps = [null, GlobalKeyAction.Mail, GlobalKeyAction.Calendar, GlobalKeyAction.People, GlobalKeyAction.People];
      return kApps[digit] ?? null;
    }
    if (ctrl && event.shiftKey && !event.altKey) {
      let key = event.key.toLowerCase();
      if (key == "m") {
        return GlobalKeyAction.NewMail;
      } else if (key == "a" || key == "q") {
        return GlobalKeyAction.NewEvent;
      } else if (key == "c") {
        return GlobalKeyAction.NewContact;
      } else if (key == "b" && !Keyboard.isTextField(event.target)) {
        return GlobalKeyAction.AddressBook;
      }
      return null;
    }
    if (event.key == "F3" && !ctrl && !event.altKey && !event.shiftKey) {
      return GlobalKeyAction.Search;
    }
    if (event.code == "KeyQ" && event.altKey && !ctrl && !event.shiftKey && !isMac) {
      return GlobalKeyAction.Search;
    }
    return null;
  }

  static async run(action: GlobalKeyAction) {
    if (action == GlobalKeyAction.Mail) {
      GlobalKeyboard.openApp(mailMustangApp);
    } else if (action == GlobalKeyAction.Calendar) {
      GlobalKeyboard.openApp(calendarMustangApp);
    } else if (action == GlobalKeyAction.People || action == GlobalKeyAction.AddressBook) {
      GlobalKeyboard.openApp(contactsMustangApp);
    } else if (action == GlobalKeyAction.NewMail) {
      let account = get(selectedAccount) ?? appGlobal.emailAccounts.first;
      assert(account, gt`Please set up a mail account first`);
      mailMustangApp.writeMail(account.newEMailFrom());
    } else if (action == GlobalKeyAction.NewEvent) {
      createNewEvent(get(selectedCalendar), get(selectedDate), false);
    } else if (action == GlobalKeyAction.NewContact) {
      GlobalKeyboard.openApp(contactsMustangApp);
      ContactsActions.newPerson(null);
    } else if (action == GlobalKeyAction.Search) {
      GlobalKeyboard.focusSearch();
    }
  }

  static openApp(app: MustangApp) {
    openApp(app, app.windowParams);
  }

  static focusSearch() {
    document.querySelector<HTMLInputElement>(".window-header .search-box input")?.focus();
  }
}
