import type { MailAccount, ConfigSource } from "../MailAccount";
import { AuthMethod } from "../../Abstract/Account";
import { TLSSocketType } from "../../Abstract/TCPAccount";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import { getOAuth2BuiltIn } from "../../Auth/OAuth2Util";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { PriorityAbortable, makeAbortable } from "../../util/flow/Abortable";
import { assert, type URLString } from "../../util/util";
import { ArrayColl } from "svelte-collections";

/** Implements the Exchange AutoDiscover V2 (JSON-based) protocol */
export async function exchangeAutoDiscoverV2JSON(domain: string, emailAddress: string, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  domain = sanitize.hostname(domain);

  // <https://learn.microsoft.com/en-us/exchange/architecture/client-access/autodiscover?view=exchserver-2019>
  // <https://www.msxfaq.de/exchange/autodiscover/autodiscover_v2.htm>
  const url1 = `https://autodiscover.${domain}/autodiscover/autodiscover.json/v1.0/${emailAddress}?Protocol=`;
  const url2 = `https://${domain}/autodiscover/autodiscover.json/v1.0/${emailAddress}?Protocol=`;
  const url3 = `http://autodiscover.${domain}/autodiscover/autodiscover.json/v1.0/${emailAddress}?Protocol=`;
  // each URL with each protocol: 3 URLs x 2 protocols = 6 URLs
  let urls = [url1, url2, url3];

  let priorityOrder = new PriorityAbortable(abort, urls.map(url =>
    fetchV2AllProtocols(url, abort)
  ));
  try {
    let config = await priorityOrder.run();
    console.log("Exchange AutoDiscover V2 JSON results:\n" + priorityOrder.printResults);
    return config;
  } catch (ex) {
    throw new Error(`Could not find a config for ${domain}`);
  }
}

async function fetchV2AllProtocols(urlPrefix: URLString, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  let protocols = ["ews", "activesync", "owa"];
  let results = await Promise.allSettled<MailAccount>(protocols.map(protocol =>
    fetchV2SingleProtocol(urlPrefix, protocol, abort)
  ));
  let successes = new ArrayColl(results.filter(r => r.status == "fulfilled").map(r => (r as any).value));
  if (successes.hasItems) {
    return successes;
  } else {
    throw (results[0] as any).reason;
  }
}

/** @param protocol Like `Account.protocol` */
async function fetchV2SingleProtocol(urlPrefix: URLString, protocol: string, abort: AbortController): Promise<MailAccount> {
  let exchangeProtocol = sanitize.translate(protocol, {
    "ews": "Ews",
    "activesync": "ActiveSync",
    "owa": "REST",
  });
  let json = await fetchJSON(urlPrefix + exchangeProtocol, abort);
  return readAutoDiscoverV2JSON(json, protocol);
}

/** @param protocol Like `Account.protocol` */
function readAutoDiscoverV2JSON(json: any, protocol: string): MailAccount {
  if (json.ErrorMessage) {
    throw new Error(json.ErrorMessage);
  }
  let url = json?.Url;
  assert(url, "No URL found");
  url = sanitize.url(url, null, ["https"]);
  assert(url, `Invalid URL found: <${url}>`);
  return newExchangeConfig(url, protocol, "autodiscover-json");
}

/** @param protocol Like `Account.protocol` */
export function newExchangeConfig(url: URLString, protocol: string, source: ConfigSource): MailAccount {
  assert(url.startsWith("https://"), "URL must be https:");
  let urlObj = new URL(url);
  if (urlObj.pathname == "/api") {
    urlObj.pathname = "/owa/";
  }
  let acc = newAccountForProtocol(protocol);
  acc.url = urlObj.href;
  acc.hostname = urlObj.hostname;
  acc.port = 443;
  acc.tls = TLSSocketType.TLS;
  acc.oAuth2 = getOAuth2BuiltIn(acc);
  acc.authMethod = acc.oAuth2
    ? AuthMethod.OAuth2
    : protocol == "ews"
      ? AuthMethod.Unknown
      : AuthMethod.Password;
  // emailAddress, username and password will be filled in by `fillConfig()` later
  acc.source = source;
  return acc;
}

let ky;

/**
 * @return {JSON}
 */
async function fetchJSON(url: URLString, abort: AbortController): Promise<any> {
  if (!ky) {
    ky = await appGlobal.remoteApp.kyCreate({
      timeout: 3000,
    });
  }
  let params = {
    result: "json",
    "Content-Type": "text/json; charset=uft8",
    retry: 0,
  };
  let json = await makeAbortable(ky.get(url, params), abort);
  assert(json && typeof (json) == "object", "Did not receive JSON");
  return json;
}
