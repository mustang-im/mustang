// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { Person } from "../../../logic/Abstract/Person";
import { writable } from "svelte/store";

export const selectedPerson = writable<Person>(null);
