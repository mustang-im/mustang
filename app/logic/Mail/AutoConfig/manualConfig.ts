import type { MailAccount } from "../MailAccount";
import type { SMTPAccount } from "../SMTP/SMTPAccount";
import { TLSSocketType } from "../../Abstract/TCPAccount";
import { AuthMethod } from "../../Abstract/Account";
import { kStandardPorts } from "../AutoConfig/configInfo";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import { getDomainForEmailAddress } from "../../util/netUtil";

export function makeManualConfig(emailAddress: string, password: string): MailAccount {
  let domain = getDomainForEmailAddress(emailAddress)
  let config = newAccountForProtocol("imap");
  config.emailAddress = emailAddress;
  config.username = emailAddress;
  config.password = password;
  config.hostname = dummyHostname(domain);
  config.tls = TLSSocketType.TLS;
  config.port = kStandardPorts.find(p => p.protocol == config.protocol && p.tls == config.tls)?.port ?? 993;
  config.authMethod = AuthMethod.Password;
  config.source = "manual";

  let outgoing = newAccountForProtocol("smtp") as any as SMTPAccount;
  outgoing.emailAddress = emailAddress;
  outgoing.username = emailAddress;
  outgoing.password = password;
  outgoing.hostname = dummyHostname(domain);
  outgoing.tls = TLSSocketType.TLS;
  outgoing.port = kStandardPorts.find(p => p.protocol == outgoing.protocol && p.tls == outgoing.tls)?.port ?? 465;
  outgoing.authMethod = AuthMethod.Password;
  outgoing.source = "manual";

  config.outgoing = outgoing;
  return config;
}

export function dummyHostname(domain: string) {
  /* Make it easy for the user to replace the hostname with the real one.
  (We check common hostnames in guessConfig, so it's not one of those.)
  This MUST NOT be a hostname that will appear in reality. We block this specific hostname. */
  return "replace-this." + domain;
}
