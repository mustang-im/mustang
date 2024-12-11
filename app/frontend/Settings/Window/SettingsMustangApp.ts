// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { MustangApp } from "../../AppsBar/MustangApp";
import SettingsApp from "./SettingsApp.svelte";
import SettingsIcon from "lucide-svelte/icons/settings";
import { gt } from "../../../l10n/l10n";

export class SettingsMustangApp extends MustangApp {
  id = "settings";
  name = gt`Settings`;
  icon = SettingsIcon;
  mainWindow = SettingsApp;
}

export const settingsMustangApp = new SettingsMustangApp();
