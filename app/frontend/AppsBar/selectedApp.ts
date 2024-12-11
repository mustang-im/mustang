// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { MustangApp } from "./MustangApp";
import { ArrayColl } from "svelte-collections";
import { writable, type Writable } from "svelte/store";

export const selectedApp: Writable<MustangApp> = writable(null);
export const sidebarApp: Writable<MustangApp> = writable(null);
export const mustangApps = new ArrayColl<MustangApp>;

/** Search bar in the window title, applies to all apps */
export const globalSearchTerm: Writable<string> = writable(null);

export function openApp(app: MustangApp) {
  selectedApp.set(app);
}
