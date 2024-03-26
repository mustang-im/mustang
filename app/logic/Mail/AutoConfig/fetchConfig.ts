import type { MailAccount } from "../MailAccount";
import { readConfigFromXML } from "./readConfig";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export async function fetchConfig(domain: string, emailAddress: string): Promise<ArrayColl<MailAccount>> {
  domain = sanitize.hostname(domain);

  function unimportantError(ex) {
    console.error(ex);
  }

  try {
    return await fetchConfigFromISP(domain);
  } catch (ex) {
    unimportantError(ex);
  }

  try {
    return await fetchConfigFromISPDB(domain);
  } catch (ex) {
    unimportantError(ex);
  }

  try {
    let mx = await getMX(domain);
    let mxDomain = getBaseDomainFromHost(mx);
    try {
      return await fetchConfigFromISP(mxDomain);
    } catch (ex) {
      unimportantError(ex);
    }
    return fetchConfigFromISPDB(mxDomain);
  } catch (ex) {
    unimportantError(ex);
  }

  throw new Error(`Could not find a config for ${emailAddress}`);
}

const kISPDBURL = "https://v1.ispdb.net/";
const kMXService = "https://mx.thunderbird.net/dns/mx/";

/**
 * Tries to get a configuration for this ISP from our central database.
 */
async function fetchConfigFromISPDB(domain) {
  let xmlStr = await fetchText(kISPDBURL + domain);
  return readConfigFromXML(xmlStr, domain);
}

async function fetchConfigFromISP(domain) {
  let url = `https://${domain}/.well-known/mail/config-v1.1.xml`;
  let xmlStr = await fetchText(url);
  return readConfigFromXML(xmlStr, domain);
}

export function getDomainForEmailAddress(emailAddress): string {
  let domain = emailAddress.split("@")[1];
  assert(domain, `No domain in email address: ${emailAddress}`);
  assert(domain.includes("."), `Need dot in the domain: ${emailAddress}`);
  return sanitize.hostname(domain);
}

/**
 * Returns the base domain of hostname.
 * E.g. for "www2.static.amazon.com" returns "amazon.com"
 * and for "www2.static.amazon.co.uk" returns "amazon.co.uk"
 */
function getBaseDomainFromHost(hostname: string): string {
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

/**
 * Queries the DNS MX for the domain
 *
 * @param domain {String}
 * @returns hostname of the first MX server
 */
async function getMX_node(domain: string): Promise<string> {
  let results = await dns.resolveMx(domain);
  assert(results.length, `No MX found for domain ${domain}`);
  let mxs = results.map(result => sanitize.hostname(result.exchange));
  return mxs[0];
}

/**
 * Queries the DNS MX for the domain
 *
 * @param domain {String}
 * @returns hostname of the first MX server
 */
async function getMX(domain: string): Promise<string> {
  let mxStr = await fetchText(kMXService + domain);
  let mxs = mxStr.split("\n");
  assert(mxs.length, `No MX found for domain ${domain}`);
  mxs = mxs.map(mx => sanitize.hostname(mx));
  return mxs[0];
}

let ky;

async function fetchText(url: string) {
  if (!ky) {
    ky = await appGlobal.remoteApp.kyCreate();
  }
  try {
    let text = await ky.get(url, { result: "text" });
    assert(text && typeof (text) == "string", "Did not receive text");
    return text;
  } catch (ex) {
    throw new Error(`Failed to fetch ${url}: ${ex.message}`);
  }
}
