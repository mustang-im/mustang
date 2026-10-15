export interface StoredSetting<S> {
  value: S;
}

export class OptionValue<T, S = T> {
  value: T;
  protected readonly initialValue: T;
  protected readonly setting: StoredSetting<S>;
  protected readonly toValue: (stored: S) => T;
  protected readonly toStored: (value: T, stored: S) => S;

  constructor(setting: StoredSetting<S>, toValue: (stored: S) => T, toStored: (value: T, stored: S) => S) {
    this.setting = setting;
    this.toValue = toValue;
    this.toStored = toStored;
    this.initialValue = toValue(setting.value);
    this.value = this.initialValue;
  }

  get isChanged(): boolean {
    return JSON.stringify(this.value) != JSON.stringify(this.initialValue);
  }

  save() {
    if (this.isChanged) {
      this.setting.value = this.toStored(this.value, this.setting.value);
    }
  }

  static plain<T>(setting: StoredSetting<T>): OptionValue<T> {
    return new OptionValue<T>(setting, stored => stored, value => value);
  }

  static listMember(setting: StoredSetting<string[]>, member: string): OptionValue<boolean, string[]> {
    return new OptionValue<boolean, string[]>(setting,
      stored => (stored ?? []).includes(member),
      (isMember, stored) => isMember
        ? [ ...(stored ?? []).filter(entry => entry != member), member ]
        : (stored ?? []).filter(entry => entry != member));
  }

  static equals<S>(setting: StoredSetting<S>, onValue: S, offValue: S): OptionValue<boolean, S> {
    return new OptionValue<boolean, S>(setting,
      stored => stored == onValue,
      isOn => isOn ? onValue : offValue);
  }
}
