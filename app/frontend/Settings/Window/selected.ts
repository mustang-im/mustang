// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { SettingsCategory } from "./SettingsCategory";
import type { Account } from "../../../logic/Abstract/Account";
import { writable } from "svelte/store";

export const selectedCategory = writable<SettingsCategory>();
export const selectedAccount = writable<Account>();

