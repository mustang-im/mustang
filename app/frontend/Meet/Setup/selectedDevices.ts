// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { writable } from "svelte/store";

export const cameraOn = writable(false);
export const micOn = writable(false);
export const screenShareOn = writable(false);
export const selectedCamera = writable<string>();
export const selectedMic = writable<string>();
export const selectedLoudspeaker = writable<string>();
