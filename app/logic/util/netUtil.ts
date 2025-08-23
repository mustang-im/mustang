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
  // return psl.get(hostname);
  let parts = 2;
  if (hostname.endsWith("co.uk") || hostname.endsWith("com.au")) {
    parts = 3;
  }
  return hostname.split(".").slice(-parts).join(".");
}

/**
 * Returns the base domain of a URL.
 * E.g. for "https://www2.static.amazon.co.uk/foo/bar.html"
 * returns "amazon.co.uk".
 * @throws in case the URL is malformed or is a
 * @throws for relative URLs like "/foo/bar.html"
 */
export function getBaseDomainFromURL(url: string): string {
  let hostname = new URL(url).hostname;
  return getBaseDomainFromHost(hostname);
}
