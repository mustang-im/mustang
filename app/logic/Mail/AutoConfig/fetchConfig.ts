import type { MailAccount } from "../MailAccount";
import { readConfigFromXML } from "./readConfig";
import { appGlobal } from "../../app";
import { PriorityAbortable, makeAbortable } from "../../util/Abortable";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { getBaseDomainFromHost } from "../../util/netUtil";
import { URLPart } from "../../../frontend/Util/util";
import { assert, type URLString } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

/** Implements the Autoconfig protocol
 * <https://www.ietf.org/archive/id/draft-ietf-mailmaint-autoconfig-04.html> */
export async function fetchConfig(domain: string, emailAddress: string, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  domain = sanitize.hostname(domain);

  let priorityOrder = new PriorityAbortable(abort, [
    fetchConfigFromISPDB(domain, abort),
    fetchConfigFromISP(domain, emailAddress, abort),
    fetchConfigForMX(domain, abort),
  ]);
  try {
    let config = await priorityOrder.run();
    console.log("Fetch config results:\n" + priorityOrder.printResults);
    return config;
  } catch (ex) {
    throw new Error(`Could not find a config for ${domain}`);
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
    url1 += URLPart`?emailaddress=${emailAddress}`;
  }
  let url2 = `https://${domain}/.well-known/autoconfig/mail/config-v1.1.xml`;
  let url3 = `http://autoconfig.${domain}/mail/config-v1.1.xml`; // TODO HTTP needed, given MX?

  let priorityOrder = new PriorityAbortable(abort, [
    fetchText(url1, abort),
    fetchText(url2, abort),
    fetchText(url3, abort),
  ]);
  let xmlStr = await priorityOrder.run();
  console.log("Fetch from ISP results:\n" + priorityOrder.printResults);
  return readConfigFromXML(xmlStr, domain, "autoconfig-isp");
}

async function fetchConfigForMX(domain, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  let mx = await getMX(domain, abort);
  let baseDomain = getBaseDomainFromHost(mx); // e.g. "foo.com" for "mx1.olc.foo.com"
  let longDomain = mx.split(".").slice(1).join("."); // everything after host, e.g. "olc.foo.com" for "mx1.olc.foo.com"
  let requests = [
    // fetchConfigFromISP(longDomain, null, abort), // without emailAddress
    fetchConfigFromISPDB(longDomain, abort),
  ];
  if (baseDomain.length < longDomain.length) {
    requests.push(
      fetchConfigFromISP(baseDomain, null, abort), // ditto
      fetchConfigFromISPDB(baseDomain, abort),
    );
  }
  let priorityOrder = new PriorityAbortable(abort, requests);
  let config = await priorityOrder.run();
  console.log("Fetch via MX results:\n" + priorityOrder.printResults);
  return config;
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
  let text = await makeAbortable(ky.get(url, { result: "text", retry: 0 }), abort);
  assert(text && typeof (text) == "string", "Did not receive text");
  return text;
}
