import { AuthMethod, MailAccount, TLSSocketType } from "../../../../logic/Mail/MailAccount";
import { newAccountForProtocol } from "../../../../logic/Mail/MailAccounts";
import JXON from "../../../../../lib/util/JXON";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../../../logic/util/util";
import { ArrayColl } from "svelte-collections";

export function readConfigFromXML(autoconfigXMLStr: string, forDomain: string, unimportantError = (ex) => console.error(ex)): ArrayColl<MailAccount> {
  let autoconfigXML = JXON.parse(autoconfigXMLStr);
  function ensureArray(value) {
    return value === undefined ? [] : value;
  }
  if (typeof (autoconfigXML) != "object" ||
    !autoconfigXML?.clientConfig?.emailProvider) {
    console.log("autoconfig xml", JSON.stringify(autoconfigXML, null, 2), autoconfigXML);
    throw new Error("Config syntax error");
  }
  let xml = autoconfigXML.clientConfig.emailProvider;

  let configs = new ArrayColl<MailAccount>();

  let displayName = xml.displayName ? sanitize.label(xml.displayName) : sanitize.hostname(xml["@id"]);
  //let domains = xml.$domain.map(domain => sanitize.hostname(domain));
  assert(ensureArray(xml.$domain).includes(forDomain), "Need proper <domain> in XML");
  let firstError: Error;

  // Incoming server
  for (let iX of ensureArray(xml.$incomingServer)) {
    try {
      let protocol = sanitize.enum(iX["@type"], ["pop3", "imap"], null);
      assert(protocol, "Need type for <incomingServer>");
      let account = newAccountForProtocol(protocol);

      account.name = displayName;
      account.hostname = sanitize.hostname(iX.hostname);
      account.port = sanitize.portTCP(iX.port);
      account.username = sanitize.string(iX.username); // may be a %VARIABLE%
      if (iX.password) {
        account.password = sanitize.string(iX.password);
      }

      // Take first supported
      account.tls = ensureArray(iX.$socketType).find(socketType => sanitize.translate(socketType, {
        plain: TLSSocketType.Plain,
        SSL: TLSSocketType.TLS,
        STARTTLS: TLSSocketType.STARTTLS
      }, null));
      assert(account.tls, "No supported <socketType> in autoconfig");

      // Take first supported auth method
      account.authMethod = ensureArray(iX.$authentication).find(auth => sanitize.translate(auth, {
        "password-cleartext": AuthMethod.Password,
        "OAuth2": AuthMethod.OAuth2,
        "password-encrypted": AuthMethod.CRAMMD5,
        "GSSAPI": AuthMethod.GSSAPI,
        "NTLM": AuthMethod.NTLM,
      }, null));
      assert(account.authMethod, "No supported <authentication> method in autoconfig");

      configs.push(account);
    } catch (ex) {
      firstError = ex;
    }
  }
  if (!configs.length) {
    throw firstError ?? new Error("No working <incomingServer> in autoconfig XML found");
  }
  firstError = null;

  // Outgoing server TODO

  return configs;
}
