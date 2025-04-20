import { MailAccount, type ConfigSource } from "../MailAccount";
import { AuthMethod } from "../../Abstract/Account";
import { TLSSocketType } from "../../Abstract/TCPAccount";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import { kStandardPorts } from "./configInfo";
import { OAuth2URLs } from "../../Auth/OAuth2URLs";
import { appGlobal } from "../../app";
import { getBaseDomainFromHost, getDomainForEmailAddress } from "../../util/netUtil";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import JXON from "../../../../lib/util/JXON";
import { PriorityAbortable, makeAbortable } from "../../util/Abortable";
import { assert, type URLString } from "../../util/util";
import { ArrayColl } from "svelte-collections";

/** Implements the Exchange AutoDiscover V1 (XML-SOAP-based) protocol */
export async function exchangeAutoDiscoverV1XML(domain: string, emailAddress: string, username: string | null, password: string, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  domain = sanitize.hostname(domain);

  // <https://technet.microsoft.com/en-us/library/bb124251(v=exchg.160).aspx#Autodiscover%20services%20in%20Outlook>
  // <https://docs.microsoft.com/en-us/previous-versions/office/developer/exchange-server-interoperability-guidance/hh352638(v%3Dexchg.140)>, search for "The Autodiscover service uses one of these four methods"
  const url1 = `https://autodiscover.${domain}/autodiscover/autodiscover.xml`;
  const url2 = `https://${domain}/autodiscover/autodiscover.xml`;
  const url3 = `http://autodiscover.${domain}/autodiscover/autodiscover.xml`;
  const body = `<?xml version="1.0" encoding="utf-8"?>
    <Autodiscover xmlns="http://schemas.microsoft.com/exchange/autodiscover/outlook/requestschema/2006">
      <Request>
        <EMailAddress>${emailAddress}</EMailAddress>
        <AcceptableResponseSchema>http://schemas.microsoft.com/exchange/autodiscover/outlook/responseschema/2006a</AcceptableResponseSchema>
      </Request>
    </Autodiscover>`;

  const callArgs = {
    body: body,
    headers: {
      // outlook.com needs this exact string, with space and lower case "utf".
      // Compare bug 1454325 comment 15.
      "Content-Type": "text/xml; charset=utf-8",
    },
    username: username ?? emailAddress,
    password: password,
    allowAuthPrompt: false,
  };

  let priorityOrder = new PriorityAbortable(abort, [
    fetchV1(url1, callArgs, abort),
    fetchV1(url2, callArgs, abort),
    fetchV1HTTP(url3, callArgs, emailAddress, abort),
  ]);
  try {
    let config = await priorityOrder.run();
    console.log("Exchange AutoDiscover V1 XML results:\n" + priorityOrder.printResults);
    return config;
  } catch (ex) {
    throw new Error(`Could not find an Exchange V1 XML config for ${emailAddress}`);
  }
}

export async function fetchV1(url: URLString, callArgs: any, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  let xmlStr = await fetchXML(url, callArgs, abort);
  return readAutoDiscoverV1XML(xmlStr);
}

async function fetchV1HTTP(url: URLString, callArgs: any, emailAddress: string, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  // url is HTTP (not HTTPS), so suppress password. Even MS spec demands so.
  const argsNoPassword: any = {};
  Object.assign(argsNoPassword, callArgs);
  delete argsNoPassword.username;
  delete argsNoPassword.password;

  let response = await fetchHTTP(url, argsNoPassword, abort);
  if (await response.ok) {
    let xmlStr = await response.text();
    return readAutoDiscoverV1XML(xmlStr);
  }
  let redirectURL = await response.url;
  if (url == redirectURL) {
    throw new Error(`Request failed with status code ${await response.status} ${await response.statusText}`);
  }

  // We've received a HTTP redirect, from an untrusted HTTP host. Check whether the target is OK to submit the password to.
  assert(redirectURL.startsWith("https://"), `Exchange AutoDiscover URL ${url} redirected to a HTTP URL ${redirectURL}. Not following that. It must be HTTPS.`);
  let fileExt = url.slice(url.lastIndexOf("."));
  assert(redirectURL.endsWith(fileExt), `Exchange AutoDiscover redirect URL seems to be the wrong file type: ${redirectURL}. Skipping.`);
  let redirectDomain = getBaseDomainFromHost(new URL(redirectURL).hostname);
  let originalDomain = getDomainForEmailAddress(emailAddress);
  if (["office.com", "office365.com", "outlook.com"].includes(redirectDomain)) {
    throw new Error("Office365 should use AutoConfig or AutoDiscover V2 JSON. It doesn't support AutoDiscover V1 XML with password anymore.");
  };
  if (redirectDomain == originalDomain) {
    return await fetchV1(redirectURL, callArgs, abort);
  }
  // Ask user to confirm redirect, but only if there is no better config found in parallel.
  let askConfig = new ConfirmExchangeRedirect();
  askConfig.emailAddress = emailAddress;
  askConfig.url = redirectURL;
  askConfig.callArgs = callArgs;
  return new ArrayColl([askConfig]);
}

/** Fake config object to tell findConfig() to ask the user to confirm the redirect.
 * The following fields are populated with:
 * `.emailAddress` = original request by user
 * `.url` = AutoDiscover redirect URL (not the mail server URL)
*/
export class ConfirmExchangeRedirect extends MailAccount {
  callArgs: any;
}

function readAutoDiscoverV1XML(xmlStr: string): ArrayColl<MailAccount> {
  let jxon = JXON.parse(xmlStr);
  assert(typeof (jxon) == "object", "Did not receive XML");
  let protocolsXML = jxon?.Autodiscover?.Response?.Account?.$Protocol;
  console.log("Got AutoDiscover XML", protocolsXML, "full", jxon);
  assert(protocolsXML, "Did not receive valid AutoDiscover XML");
  let accounts = new ArrayColl<MailAccount>();
  for (let protocolXML of protocolsXML) {
    try {
      let protocol = sanitize.enum(protocolXML.Type,
        ["WEB", "EXHTTP", "EXCH", "EXPR", "POP3", "IMAP", "SMTP"], null);
      if (protocol == "WEB") {
        let urlXML = protocolXML.External ?? protocolXML.Internal;
        assert(urlXML, "AutoDiscover: WEB: Nothing found");
        let owaURL = sanitize.url(urlXML.OWAUrl?.value, null);
        let ewsURL = sanitize.url(urlXML.Protocol?.ASUrl, null);
        if (owaURL && !accounts.find(acc => acc.url == owaURL && acc.protocol == "owa")) {
          accounts.add(newURLAccount(owaURL, "owa", "autodiscover-xml"));
        }
        if (ewsURL && !accounts.find(acc => acc.url == ewsURL && acc.protocol == "ews")) {
          accounts.add(newURLAccount(ewsURL, "ews", "autodiscover-xml"));
        }
      } else if (protocol == "EXHTTP" || protocol == "EXCH") {
        let ewsURL = sanitize.url(protocolXML.EwsUrl ?? protocolXML.ASUrl, null);
        if (ewsURL && !accounts.find(acc => acc.url == ewsURL && acc.protocol == "ews")) {
          accounts.add(newURLAccount(ewsURL, "ews", "autodiscover-xml"));
        }
      } else if (protocol == "IMAP" || protocol == "POP3") {
        let acc = newAccountForProtocol(protocol.toLowerCase());
        acc.hostname = sanitize.hostname(protocolXML.Server);
        acc.port = sanitize.portTCP(protocolXML.Port);
        let ssl = typeof (protocolXML.SSL) == "string" && protocolXML.SSL.toLowerCase() == "on" || // "On" or "Off"
          typeof (protocolXML.Encryption) == "string" && protocolXML.Encryption.toLowerCase() != "none";  // "None", "SSL", "TLS", "Auto"
        // SSL is too unspecific. Do they mean STARTTLS or normal TLS?
        let tlsOptions = kStandardPorts.filter(p => p.protocol == acc.protocol && p.port == acc.port);
        acc.tls = ssl
          ? tlsOptions.find(p => p.tls != TLSSocketType.Plain)?.tls ?? TLSSocketType.TLS
          : tlsOptions.find(p => p.tls != TLSSocketType.STARTTLS)?.tls ?? TLSSocketType.Plain;
        acc.authMethod = AuthMethod.Password;
        acc.username = sanitize.string(protocolXML.LoginName, null);
        accounts.add(acc);
      } else {
        // Skip unknown
      }
    } catch (ex) {
      console.error(ex); // Do not report to user nor error server
    }
  }
  setSTMPServer(accounts);
  // emailAddress, username and password will be filled in by `fillConfig()` later
  assert(accounts.hasItems, "No applicable config found");
  return accounts;
}

function setSTMPServer(accounts: ArrayColl<MailAccount>) {
  let smtpAccounts = accounts.filter(acc => acc.protocol == "smtp");
  let imapPOPAccounts = accounts.filter(acc => acc.protocol == "imap" || acc.protocol == "pop3");
  if (imapPOPAccounts.hasItems && smtpAccounts.isEmpty) {
    let imap = imapPOPAccounts.first;
    let smtp = newAccountForProtocol("smtp");
    smtp.hostname = imap.hostname;
    smtp.tls = imap.tls;
    smtp.port = kStandardPorts.find(p => p.protocol == "smtp" && p.tls == smtp.tls)?.port;
    smtp.authMethod = imap.authMethod;
    smtp.source = imap.source;
  }
  if (imapPOPAccounts.hasItems) {
    let smtp = smtpAccounts.first;
    if (!smtp) {
      let imap = imapPOPAccounts.first;
      smtp = newAccountForProtocol("smtp");
      smtp.hostname = imap.hostname;
      smtp.tls = imap.tls;
      smtp.port = kStandardPorts.find(p => p.protocol == "smtp" && p.tls == smtp.tls)?.port;
      smtp.authMethod = imap.authMethod;
      smtp.source = imap.source;
    }
    for (let acc of imapPOPAccounts) {
      acc.outgoing = smtp;
    }
  }
  accounts.removeAll(smtpAccounts);
}

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
  let protocols = ["ews", "activesync"];
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
  return newURLAccount(url, protocol, "autodiscover-json");
}

/** @param protocol Like `Account.protocol` */
function newURLAccount(url: URLString, protocol: string, source: ConfigSource): MailAccount {
  assert(url.startsWith("https://"), "URL must be https:");
  let acc = newAccountForProtocol(protocol);
  acc.url = url;
  acc.hostname = new URL(acc.url).hostname;
  acc.port = 443;
  acc.tls = TLSSocketType.TLS;
  acc.authMethod = OAuth2URLs.some(oauth => oauth.domains.includes(acc.hostname))
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
    ky = await appGlobal.remoteApp.kyCreate();
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

/**
 * @return XML as string
 */
async function fetchXML(url: URLString, params: any, abort: AbortController): Promise<string> {
  if (params.username && params.password) {
    if (!params.headers) {
      params.headers = {};
    }
    let str = params.username + ":" + params.password;
    let utf8 = String.fromCharCode(...new TextEncoder().encode(str));
    params.headers.Authorization = "Basic " + btoa(utf8);
  }
  let response = await fetchHTTP(url, params, abort);
  if (await response.ok) {
    return await response.text();
  }
  let responseURL = await response.url;
  let fileExt = url.slice(url.lastIndexOf("."));
  if (responseURL != url && responseURL.startsWith("https://") && responseURL.endsWith(fileExt)) {
    // The redirect will have corrupted the request (HTTP POST->GET, and dropped body); retry with the new URL.
    response = await fetchHTTP(responseURL, params, abort);
    if (await response.ok) {
      return await response.text();
    }
  }
  throw new Error(`Request failed with status code ${await response.status} ${await response.statusText}`);
}

/**
 * @return Response as remoted by JPC (type isn't exactly correct)
 */
async function fetchHTTP(url: URLString, params: any, abort: AbortController): Promise<Response> {
  if (!ky) {
    ky = await appGlobal.remoteApp.kyCreate();
  }
  params = Object.assign({ throwHttpErrors: false }, params);
  return await makeAbortable(ky.post(url, params), abort);
}
