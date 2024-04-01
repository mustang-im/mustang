import type { MailAccount } from "../MailAccount";
import { readConfigFromXML } from "./readConfig";
import { appGlobal } from "../../app";
import { PriorityAbortable, makeAbortable } from "../../util/Abortable";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, type URLString } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export async function fetchConfig(domain: string, emailAddress: string, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  domain = sanitize.hostname(domain);

  let priorityOrder = new PriorityAbortable(abort, [
    fetchConfigFromISP(domain, emailAddress, abort),
    fetchConfigFromISPDB(domain, abort),
    fetchConfigForMX(domain, abort),
  ]);
  try {
    return await priorityOrder.run();
  } catch (ex) {
    throw new Error(`Could not find a config for ${emailAddress}`);
  }
}

const kISPDBURL = "https://v1.ispdb.net/";
const kMXService = "https://mx.thunderbird.net/dns/mx/";

/**
 * Tries to get a configuration for this ISP from our central database.
 */
async function fetchConfigFromISPDB(domain: string, abort: AbortController) {
  let xmlStr = await fetchText(kISPDBURL + domain, abort);
  return readConfigFromXML(xmlStr, domain);
}

async function fetchConfigFromISP(domain: string, emailAddress: string | null, abort: AbortController) {
  let url1 = `https://autoconfig.${domain}/mail/config-v1.1.xml`;
  if (emailAddress) {
    url1 += `?emailaddress=${emailAddress}`;
  }
  let url2 = `https://${domain}/.well-known/autoconfig/mail/config-v1.1.xml`;
  let url3 = `http://autoconfig.${domain}/mail/config-v1.1.xml`; // TODO HTTP needed, given MX?

  let priorityOrder = new PriorityAbortable(abort, [
    fetchText(url1, abort),
    fetchText(url2, abort),
    fetchText(url3, abort),
  ]);
  let xmlStr = await priorityOrder.run();
  return readConfigFromXML(xmlStr, domain);
}

async function fetchConfigForMX(domain, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  let mx = await getMX(domain, abort);
  let mxDomain = getBaseDomainFromHost(mx);
  let priorityOrder = new PriorityAbortable(abort, [
    fetchConfigFromISP(mxDomain, null, abort), // without emailAddress
    fetchConfigFromISPDB(mxDomain, abort),
  ]);
  return await priorityOrder.run();
}

export function getDomainForEmailAddress(emailAddress: string): string {
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

/**
 * Queries the DNS MX for the domain
 *
 * @param domain {String}
 * @returns hostname of the first MX server
 */
async function getMX_node(domain: string, abort: AbortController): Promise<string> {
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
async function getMX(domain: string, abort: AbortController): Promise<string> {
  let mxStr = await fetchText(kMXService + domain, abort);
  let mxs = mxStr.split("\n");
  assert(mxs.length, `No MX found for domain ${domain}`);
  mxs = mxs.map(mx => sanitize.hostname(mx));
  return mxs[0];
}

let ky;

async function fetchText(url: URLString, abort: AbortController) {
  if (!ky) {
    ky = await appGlobal.remoteApp.kyCreate();
  }
  try {
    let text = await makeAbortable(ky.get(url, { result: "text", retry: 0 }), abort);
    assert(text && typeof (text) == "string", "Did not receive text");
    return text;
  } catch (ex) {
    throw new Error(`Failed to fetch ${url}: ${ex.message}`);
  }
}
