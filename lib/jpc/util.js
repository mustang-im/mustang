// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

/**
 * @param test {boolean}
 * @param errorMsg {string}
 */
export function assert(test, errorMsg) {
  if (!test) {
    throw new Error(errorMsg || "Assertion failed");
  }
}

export function consoleError(ex) {
  console.error(ex);
}
