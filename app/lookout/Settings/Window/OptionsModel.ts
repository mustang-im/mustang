import { OptionValue } from "./OptionValue";
import { WorkHoursDrafts } from "../Calendar/WorkHoursDrafts";
import { AccountDraft } from "../Mail/Account/AccountDraft";
import { IdentitiesDraft } from "../Mail/Account/IdentitiesDraft";
import type { MailAccount } from "../../../logic/Mail/MailAccount";
import type { Account } from "../../../logic/Abstract/Account";
import { CalendarSettings } from "../../Calendar/CalendarSettings";
import { ComposerSettings } from "../../Mail/Composer/ComposerSettings";
import { appGlobal } from "../../../logic/app";
import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
import { getDateTimeLocalePref, getUILocale, getUILocalePref, saveDateTimeLocale, saveUILocale, setUILocale } from "../../../l10n/l10n";

export class OptionsModel {
  protected readonly options: OptionValue<any, any>[] = [];

  readonly theme = this.add(OptionValue.plain(getLocalStorage<string>("appearance.theme", "system")));
  readonly frontend = this.add(OptionValue.plain(getLocalStorage<string>("appearance.frontend", "classic")));

  readonly composeFormat = this.add(OptionValue.plain(getLocalStorage<string>("mail.send.format", "html")));
  readonly spellcheck = this.add(OptionValue.plain(getLocalStorage<boolean>("mail.send.spellcheck.enabled", false)));
  readonly newMailSound = this.add(OptionValue.listMember(getLocalStorage<string[]>("notifications.mail", ["popup"]), "sound"));
  readonly newMailAlert = this.add(OptionValue.listMember(getLocalStorage<string[]>("notifications.mail", ["popup"]), "popup"));
  readonly newMailOnlyFromContacts = this.add(OptionValue.plain(getLocalStorage<boolean>("notifications.mail.only.addressbook", true)));
  readonly replyQuote = this.add(OptionValue.plain(getLocalStorage<string>("mail.send.quote", "below")));
  readonly forwardMode = this.add(OptionValue.plain(getLocalStorage<string>("mail.send.forward", "inline")));
  readonly repliesInNewWindow = this.add(OptionValue.plain(ComposerSettings.repliesInNewWindow));

  readonly defaultEventDuration = this.add(OptionValue.plain(getLocalStorage<number>("calendar.defaultEventLengthInMinutes", 60)));
  readonly weekNumbers = this.add(OptionValue.plain(CalendarSettings.weekNumbers));
  readonly showDeclined = this.add(OptionValue.plain(CalendarSettings.showDeclined));
  readonly timeZoneLabel = this.add(OptionValue.plain(CalendarSettings.timeZoneLabel));
  readonly secondTimeZoneShown = this.add(OptionValue.plain(CalendarSettings.secondTimeZoneShown));
  readonly secondTimeZoneLabel = this.add(OptionValue.plain(CalendarSettings.secondTimeZoneLabel));
  readonly secondTimeZone = this.add(OptionValue.plain(CalendarSettings.secondTimeZone));
  readonly thirdTimeZoneShown = this.add(OptionValue.plain(CalendarSettings.thirdTimeZoneShown));
  readonly thirdTimeZoneLabel = this.add(OptionValue.plain(CalendarSettings.thirdTimeZoneLabel));
  readonly thirdTimeZone = this.add(OptionValue.plain(CalendarSettings.thirdTimeZone));
  readonly workHours = new WorkHoursDrafts();
  protected readonly accountDrafts = new Map<Account, AccountDraft>();
  protected readonly identitiesDrafts = new Map<MailAccount, IdentitiesDraft>();
  readonly showReminders = this.add(OptionValue.listMember(getLocalStorage<string[]>("notifications.calendar", ["popup", "sound"]), "popup"));
  readonly reminderSound = this.add(OptionValue.listMember(getLocalStorage<string[]>("notifications.calendar", ["popup", "sound"]), "sound"));

  readonly displayLanguage = this.add(OptionValue.plain<string>({
    get value() { return getUILocalePref(); },
    set value(language: string) { saveUILocale(language); },
  }));
  readonly dateTimeFormat = this.add(OptionValue.plain<string>({
    get value() { return getDateTimeLocalePref(); },
    set value(language: string) { saveDateTimeLocale(language); },
  }));

  readonly readAsPlainText = this.add(OptionValue.equals(getLocalStorage<string>("mail.contentRendering", "html"), "plaintext", "html"));

  isDefaultMailApp = false;
  makeDefaultMailApp = false;

  accountDraftOf(account: Account): AccountDraft {
    let draft = this.accountDrafts.get(account);
    if (!draft) {
      draft = new AccountDraft(account);
      this.accountDrafts.set(account, draft);
    }
    return draft;
  }

  identitiesDraftOf(account: MailAccount): IdentitiesDraft {
    let draft = this.identitiesDrafts.get(account);
    if (!draft) {
      draft = new IdentitiesDraft(account);
      this.identitiesDrafts.set(account, draft);
    }
    return draft;
  }

  forgetAccount(account: Account) {
    this.accountDrafts.delete(account);
    this.identitiesDrafts.delete(account as MailAccount);
  }

  get accountWithMissingField(): Account | null {
    return [ ...this.accountDrafts.values(), ...this.identitiesDrafts.values() ]
      .find(draft => draft.missingField)?.account ?? null;
  }

  protected add<T, S>(option: OptionValue<T, S>): OptionValue<T, S> {
    this.options.push(option);
    return option;
  }

  async loadDefaultMailApp() {
    this.isDefaultMailApp = !!await appGlobal.remoteApp.isDefaultApp("mailto");
    this.makeDefaultMailApp = this.isDefaultMailApp;
  }

  get needsRestart(): boolean {
    return this.displayLanguage.isChanged;
  }

  async save() {
    for (let option of this.options) {
      option.save();
    }
    await this.workHours.save();
    for (let draft of this.accountDrafts.values()) {
      if (draft.isChanged) {
        await draft.save();
      }
    }
    for (let draft of this.identitiesDrafts.values()) {
      if (draft.isChanged) {
        await draft.save();
      }
    }
    if (this.makeDefaultMailApp && !this.isDefaultMailApp) {
      this.isDefaultMailApp = !!await appGlobal.remoteApp.setAsDefaultApp("mailto");
    }
    if (this.needsRestart) {
      setUILocale(getUILocale());
      await appGlobal.remoteApp.restartApp();
    }
  }
}
