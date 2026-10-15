import { writable } from "svelte/store";

export type OptionsCategory = "general" | "mail" | "calendar" | "language" | "advanced" | "trust-center";

export type SettingsDialog =
  { kind: "options", category: OptionsCategory };

export class SettingsDialogs {
  static readonly current = writable<SettingsDialog | null>(null);

  static open(dialog: SettingsDialog) {
    SettingsDialogs.current.set(dialog);
  }

  static openOptions(category: OptionsCategory = "general") {
    SettingsDialogs.open({ kind: "options", category });
  }

  static close() {
    SettingsDialogs.current.set(null);
  }
}
