import type { MailAccount } from "../MailAccount";
import { readConfigFromXML } from "./readConfig";
import { appGlobal } from "../../app";
import { PriorityAbortable, makeAbortable } from "../../util/Abortable";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { getBaseDomainFromHost } from "../../util/netUtil";
import { assert, type URLString } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

/** Implements the Exchange AutoDiscover V1 (XML-SOAP-based) protocol */
export async function exchangeAutoDiscoverV1XML(domain: string, emailAddress: string, abort: AbortController): Promise<ArrayColl<MailAccount>> {
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

/** Implements the Exchange AutoDiscover V2 (JSON-based) protocol */
export async function exchangeAutoDiscoverV2JSON(domain: string, emailAddress: string, abort: AbortController): Promise<ArrayColl<MailAccount>> {
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
  return readConfigFromXML(xmlStr, domain, "ispdb");
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
  return readConfigFromXML(xmlStr, domain, "autoconfig-isp");
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

/**
 * Queries the DNS MX for the domain
 *
 * @param domain {String}
 * @returns hostname of the first MX server
 */
async function getMX_node(domain: string, abort: AbortController): Promise<string> {
  let results = []; // await dns.resolveMx(domain);
  let result = results[0];
  assert(result, `No MX found for domain ${domain}`);
  return sanitize.hostname(result.exchange);
}

/**
 * Queries the DNS MX for the domain
 *
 * TODO Use DoH?
 * TODO Cache result
 * TODO Query both web service and local DNS, and
 * use the result only when they match.
 *
 * @param domain {String}
 * @returns hostname of the first MX server
 */
export async function getMX(domain: string, abort: AbortController): Promise<string> {
  let mxStr = await fetchText(kMXService + domain, abort);
  let mxs = mxStr.split("\n"); // last line might be empty
  let mx = mxs[0];
  assert(mx, `No MX found for domain ${domain}`);
  return sanitize.hostname(mx);
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
