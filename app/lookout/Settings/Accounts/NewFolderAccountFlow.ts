import { Calendar } from "../../../logic/Calendar/Calendar";
import { Addressbook } from "../../../logic/Contacts/Addressbook";
import { CalDAVCalendar } from "../../../logic/Calendar/CalDAV/CalDAVCalendar";
import { CardDAVAddressbook } from "../../../logic/Contacts/CardDAV/CardDAVAddressbook";
import { newCalendarForProtocol } from "../../../logic/Calendar/AccountsList/Calendars";
import { newAddressbookForProtocol } from "../../../logic/Contacts/AccountsList/Addressbooks";
import { AuthMethod } from "../../../logic/Abstract/Account";
import { appGlobal } from "../../../logic/app";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../../logic/util/util";
import { gt } from "../../../l10n/l10n";
import type { DAVCalendar, DAVAddressBook } from "tsdav";

export type FolderAccountKind = "calendar" | "addressbook";
export type FolderAccountStep = "type" | "settings" | "choose";
type ServerFolder = DAVCalendar | DAVAddressBook;

export class NewFolderAccountFlow {
  readonly kind: FolderAccountKind;
  step: FolderAccountStep = "type";
  isLocal = true;
  config: Calendar | Addressbook | null = null;
  available: ServerFolder[] = [];
  chosen: ServerFolder[] = [];
  isDone = false;

  constructor(kind: FolderAccountKind, localOnly = false) {
    this.kind = kind;
    if (localOnly) {
      this.chooseType(true);
    }
  }

  get protocol(): string {
    if (this.kind == "calendar") {
      return this.isLocal ? "calendar-local" : "caldav";
    }
    return this.isLocal ? "addressbook-local" : "carddav";
  }

  chooseType(isLocal: boolean) {
    this.isLocal = isLocal;
    this.config = this.kind == "calendar"
      ? newCalendarForProtocol(this.protocol)
      : newAddressbookForProtocol(this.protocol);
    this.step = "settings";
  }

  get canContinue(): boolean {
    let config = this.config;
    if (this.step == "type") {
      return true;
    }
    if (this.step == "choose") {
      return this.chosen.length > 0;
    }
    return !!config?.name?.trim() && (this.isLocal || !!config.url?.trim() && !!config.username?.trim());
  }

  toggle(folder: ServerFolder, isChosen: boolean) {
    this.chosen = isChosen
      ? [...this.chosen.filter(existing => existing != folder), folder]
      : this.chosen.filter(existing => existing != folder);
  }

  back() {
    assert(this.step != "type", "Already at the first step");
    this.step = this.step == "choose" ? "settings" : "type";
  }

  async next() {
    assert(this.canContinue, gt`Please fill in the fields first`);
    if (this.step == "type") {
      this.chooseType(this.isLocal);
      return;
    }
    if (this.step == "settings" && this.isLocal) {
      await this.saveLocal();
      this.isDone = true;
      return;
    }
    if (this.step == "settings") {
      await this.findServerFolders();
      if (this.available.length > 1) {
        this.step = "choose";
        return;
      }
    }
    await this.saveServerFolders();
    this.isDone = true;
  }

  protected async saveLocal() {
    let config = this.config;
    config.name = config.name.trim();
    // <copied from="../../../frontend/Setup/Calendar/LocalCalendarSetup.svelte"> and Contacts/LocalAddressbookSetup.svelte
    await config.save();
    if (config instanceof Calendar) {
      appGlobal.calendars.add(config);
    } else if (config instanceof Addressbook) {
      appGlobal.addressbooks.add(config);
    }
    // </copied>
  }

  protected async findServerFolders() {
    let config = this.config;
    config.url = config.url.trim();
    config.username = config.username.trim();
    // <copied from="../../../frontend/Setup/Calendar/CalDAVSetup.svelte"> and Contacts/CardDAVSetup.svelte
    config.authMethod = AuthMethod.Password;
    await config.verifyLogin();
    // </copied>
    let available = config instanceof CalDAVCalendar
      ? await config.listCalendars()
      : await (config as CardDAVAddressbook).listAddressbooks();
    assert(available?.hasItems, this.kind == "calendar"
      ? gt`No calendars found in this account`
      : gt`No address books found in this account`);
    this.available = available.contents;
    this.chosen = [this.available[0]];
  }

  protected async saveServerFolders() {
    let primary = this.available.find(folder => this.chosen.includes(folder));
    assert(primary, gt`Please choose at least one`);
    let config = this.config;
    // <copied from="../../../frontend/Setup/Calendar/CalDAVSelectCalendar.svelte" onContinue()> and Contacts/CardDAVSelectAddressbook.svelte
    if (config instanceof CalDAVCalendar) {
      config.calendarURL = sanitize.url(primary.url);
      await config.login(true);
      await config.listEvents();
      appGlobal.calendars.add(config);
    } else if (config instanceof CardDAVAddressbook) {
      config.addressbookURL = sanitize.url(primary.url);
      await config.login(true);
      await config.listContacts();
      appGlobal.addressbooks.add(config);
    }
    await config.save();
    let i = 0;
    for (let additional of this.chosen) {
      if (additional == primary) {
        continue;
      }
      let name = config.name + " " + sanitize.nonemptylabel(additional.displayName as string, "" + ++i);
      if (config instanceof CalDAVCalendar) {
        let sub = newCalendarForProtocol(config.protocol) as CalDAVCalendar;
        sub.initFromMainAccount(config);
        sub.name = name;
        sub.calendarURL = sanitize.url(additional.url);
        appGlobal.calendars.add(sub);
        await sub.save();
        sub.listEvents()
          .catch(backgroundError);
      } else if (config instanceof CardDAVAddressbook) {
        let sub = newAddressbookForProtocol(config.protocol) as CardDAVAddressbook;
        sub.initFromMainAccount(config);
        sub.name = name;
        sub.addressbookURL = sanitize.url(additional.url);
        appGlobal.addressbooks.add(sub);
        await sub.save();
        sub.listContacts()
          .catch(backgroundError);
      }
    }
    // </copied>
  }
}
