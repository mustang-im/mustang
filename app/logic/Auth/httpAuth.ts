// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { gt } from "../../l10n/l10n";
import { assert } from "../util/util";

/** @returns Content of Authentication: HTTP header */
export function basicAuth(username: string, password: string): string {
  assert(username, gt`Need username`);
  assert(password, gt`Need password`);
  // node.js: const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
  const basicAuth = btoa(`${username}:${password}`);
  return `Basic ${basicAuth}`;
}
