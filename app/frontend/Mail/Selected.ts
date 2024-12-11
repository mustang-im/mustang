// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { MailAccount } from "../../logic/Mail/MailAccount";
import type { Folder } from "../../logic/Mail/Folder";
import type { EMail } from "../../logic/Mail/EMail";
import type { ArrayColl } from "svelte-collections";
import { writable } from "svelte/store";

export const selectedAccount = writable<MailAccount>();
export const selectedFolder = writable<Folder>();
export const selectedMessage = writable<EMail>();
export const selectedMessages = writable<ArrayColl<EMail>>();
