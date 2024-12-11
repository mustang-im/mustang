// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import psl from "psl";

export function getDomainForEmailAddress(emailAddress): string {
  // Do not throw, because this function is used in {UI code}
  return sanitize.hostname(emailAddress.split("@").pop(), "unknown");
}

/**
 * Returns the base domain of hostname.
 * E.g. for "www2.static.amazon.com" returns "amazon.com"
 * and for "www2.static.amazon.co.uk" returns "amazon.co.uk"
 */
export function getBaseDomainFromHost(hostname: string): string {
  return psl.get(hostname);
}
