import { OptionValue } from "./OptionValue";
import { CalendarSettings } from "../../Calendar/CalendarSettings";
import { ComposerSettings } from "../../Mail/Composer/ComposerSettings";
import { appGlobal } from "../../../logic/app";
import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
import { getDateTimeLocalePref, getUILocale, getUILocalePref, saveDateTimeLocale, saveUILocale, setUILocale } from "../../../l10n/l10n";

export class OptionsModel {
  protected readonly options: OptionValue<any, any>[] = [];

  readonly theme = this.add(OptionValue.plain(getLocalStorage<string>("appearance.theme", "system")));

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
    if (this.makeDefaultMailApp && !this.isDefaultMailApp) {
      this.isDefaultMailApp = !!await appGlobal.remoteApp.setAsDefaultApp("mailto");
    }
    if (this.needsRestart) {
      setUILocale(getUILocale());
      await appGlobal.remoteApp.restartApp();
    }
  }
}
