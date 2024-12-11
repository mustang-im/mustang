// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { IObservable } from "../../../logic/util/Observable";

export interface PersonOrGroup extends IObservable {
  id: string;
  name: string;
  picture: string; /** URL */
}
