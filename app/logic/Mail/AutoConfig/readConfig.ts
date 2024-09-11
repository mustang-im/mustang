import { AuthMethod, MailAccount, TLSSocketType, type ConfigSource } from "../MailAccount";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import type { SMTPAccount } from "../SMTP/SMTPAccount";
import { OAuth2 } from "../../Auth/OAuth2";
import { OAuth2URLs } from "../../Auth/OAuth2URLs";
import JXON from "../../../../lib/util/JXON";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";

export function readConfigFromXML(autoconfigXMLStr: string, forDomain: string, source: ConfigSource): ArrayColl<MailAccount> {
  let autoconfigXML = JXON.parse(autoconfigXMLStr);
  if (typeof (autoconfigXML) != "object" ||
    !autoconfigXML?.clientConfig?.emailProvider) {
    console.log("autoconfig xml", JSON.stringify(autoconfigXML, null, 2), autoconfigXML);
    throw new Error("Config syntax error");
  }
  let xml = autoconfigXML.clientConfig.emailProvider;

  let configs = new ArrayColl<MailAccount>();
  let outgoingConfigs = new ArrayColl<SMTPAccount>();

  let displayName = sanitize.label(xml.displayName, sanitize.label(xml["@id"], forDomain));
  //let domains = xml.$domain.map(domain => sanitize.hostname(domain));
  assert(ensureArray(xml.$domain).includes(forDomain), "Need proper <domain> in XML");
  let firstError: Error;

  // Incoming server
  for (let iX of ensureArray(xml.$incomingServer)) {
    try {
      configs.push(readServer(iX, displayName, xml, source));
    } catch (ex) {
      firstError = ex;
    }
  }
  if (!configs.length) {
    throw firstError ?? new Error(`No working <incomingServer> in autoconfig XML for ${forDomain} found`);
  }
  firstError = null;

  // Outgoing server
  for (let oX of ensureArray(xml.$outgoingServer)) {
    try {
      outgoingConfigs.push(readServer(oX, displayName, xml, source) as SMTPAccount);
    } catch (ex) {
      firstError = ex;
    }
  }
  if (!outgoingConfigs.length) {
    throw firstError ?? new Error(`No working <outgoingServer> in autoconfig XML for ${forDomain} found`);
  }
  let outgoing = outgoingConfigs.first;
  for (let config of configs) {
    if (config.protocol == "imap" || config.protocol == "pop3") {
      config.outgoing = outgoing;
    }
  }

  return configs;
}

/**
 * @param {JXON} xml <incomingServer> or <outgoingServer>
 */
function readServer(xml: any, displayName: string, fullXML: any, source: ConfigSource): MailAccount {
  let protocol = sanitize.enum(xml["@type"], ["pop3", "imap", "jmap", "smtp", "ews", "owa", "activesync", "exchange"], null);
  assert(protocol, `Need type for <incomingServer> in autoconfig XML for ${displayName}`);

  if (protocol == "exchange") { // Backwards compat
    let ewsURL = sanitize.url(xml.ewsURL, null);
    let owaURL = sanitize.url(xml.owaURL, null);
    let activeSyncURL = sanitize.url(xml.easURL, null);
    assert(ewsURL || owaURL || activeSyncURL, "Malformed or unknown Exchange config");
    // Return only the most preferred config (for this backwards compat)
    protocol = ewsURL ? "ews" : owaURL ? "owa" : "activesync";
    xml.url = ewsURL ?? owaURL ?? activeSyncURL;
    assert(xml.url, "Need URL for Exchange servers");
  }

  let account = newAccountForProtocol(protocol);

  account.name = displayName;
  account.url = sanitize.url(xml.url, null);
  if (account.url) {
    let url = new URL(account.url);
    account.hostname = url.hostname;
    account.port = url.port
      ? sanitize.portTCP(url.port)
      : url.protocol == "https:" ? 443 : url.protocol == "http:" ? 80 : null;
    assert(account.port, "Need port number or known protocol in URL");
  } else {
    account.hostname = sanitize.hostname(xml.hostname);
    account.port = sanitize.portTCP(xml.port);
  }
  account.username = sanitize.string(xml.username); // may be a %VARIABLE%
  if (xml.password) {
    account.password = sanitize.string(xml.password);
  }

  if (account.url) {
    account.tls = account.url.startsWith("https:") ? TLSSocketType.TLS : account.url.startsWith("http:") ? TLSSocketType.Plain : null;
  } else {
    // Take first supported
    account.tls = ensureArray(xml.$socketType).map(socketType => sanitize.translate(socketType, {
      plain: TLSSocketType.Plain,
      SSL: TLSSocketType.TLS,
      STARTTLS: TLSSocketType.STARTTLS
    }, null)).find(v => v !== null);
  }
  assert(account.tls, "No supported <socketType> in autoconfig");

  let authMethods = ensureArray(xml.$authentication).map(auth => sanitize.translate(auth, {
    "password-cleartext": AuthMethod.Password,
    "OAuth2": AuthMethod.OAuth2,
    "password-encrypted": AuthMethod.CRAMMD5,
    "GSSAPI": AuthMethod.GSSAPI,
    "NTLM": AuthMethod.NTLM,
  }, null)).filter(v => v !== null);
  // Take first supported auth method
  for (let authMethod of authMethods) {
    try {
      account.authMethod = authMethod;
      getOAuth2Config(account, fullXML);
      break; // success -> use this auth method
    } catch (ex) {
      console.log(account.name + ":", ex?.message ?? ex + "");
      // try next
    }
  }
  assert(account.authMethod, `No supported <authentication> method in autoconfig XML for ${displayName}\n\nGot authentication methods ${JSON.stringify(xml.$authentication, null, 2)}`);

  account.source = source;
  return account;
}

function getOAuth2Config(account: MailAccount, autoConfigXML: any): OAuth2 {
  if (![AuthMethod.OAuth2].includes(account.authMethod)) {
    return;
  }
  let oAuth2: OAuth2;
  // try built-in
  let builtin = OAuth2URLs.find(a => a.hostnames.includes(account.hostname));
  if (builtin) {
    oAuth2 = new OAuth2(account, builtin.tokenURL, builtin.authURL, builtin.authDoneURL, builtin.scope, builtin.clientID, builtin.clientSecret, builtin.doPKCE);
    oAuth2.setTokenURLPasswordAuth(builtin.tokenURLPasswordAuth);
  } else {
    try {
      let xml = autoConfigXML.oAuth2;
      oAuth2 = new OAuth2(
        this,
        sanitize.url(xml.tokenURL),
        sanitize.url(xml.authURL),
        sanitize.url(xml.authDoneURL, null),
        sanitize.nonemptystring(xml.scope),
        sanitize.nonemptystring(xml.clientID, "mail"),
        sanitize.nonemptystring(xml.clientSecret, null),
      );
    } catch (ex) {
      console.error(ex);
    }
  }
  assert(oAuth2, "No suitable OAuth2 config found, neither in AutoConfig XML, nor built-in");
  account.oAuth2 = oAuth2;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}
