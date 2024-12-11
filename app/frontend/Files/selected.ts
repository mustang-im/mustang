// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { FileOrDirectory } from "../../logic/Files/File";
import { writable, type Writable } from "svelte/store";

export let selectedFile: Writable<FileOrDirectory> = writable(null);
