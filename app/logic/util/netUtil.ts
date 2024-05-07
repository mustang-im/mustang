import { sanitize } from "../../../lib/util/sanitizeDatatypes";

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
  let domainparts = hostname.split(".");
  let tld = domainparts.slice().pop();
  // TODO use <https://publicsuffix.org>
  // Compare Firefox EffectiveTLD.getBaseDomainFromHost()
  if (tld == "uk" || tld == "au") {
    return domainparts.slice(domainparts.length - 3).join(".");
  } else {
    return domainparts.slice(domainparts.length - 2).join(".");
  }
}
