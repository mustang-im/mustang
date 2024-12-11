// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { Observable } from "../../logic/util/Observable";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";

class ObservableLocalStorageSetting<T> extends Observable {
  readonly key: string;
  defaultValue: T = undefined;
  constructor(key: string, defaultValue?: T) {
    super();
    this.key = key;
    this.defaultValue = defaultValue;
  }
  get value(): T {
    return JSON.parse(sanitize.nonemptystring(localStorage.getItem(this.key), null)) ?? this.defaultValue;
  }
  set value(val: T) {
    localStorage.setItem(this.key, JSON.stringify(val));
    this.notifyObservers();
  }
  withDefault(defaultValue: T): T {
    this.defaultValue = defaultValue;
    return this.value;
  }
}

const settings = new Map<string, ObservableLocalStorageSetting<any>>();

export function getLocalStorage<T>(key: string, defaultValue?: T): ObservableLocalStorageSetting<T> {
  let existing = settings.get(key);
  if (existing) {
    return existing;
  }
  let setting = new ObservableLocalStorageSetting(key, defaultValue);
  settings.set(key, setting);
  return setting;
}
