import { TLSSocketType, type MailAccount } from "../MailAccount";
import { IMAPAccount } from "../IMAP/IMAPAccount";
import { SMTPAccount } from "../SMTP/SMTPAccount";
import { getDomainForEmailAddress } from "./fetchConfig";
import { kStandardPorts } from "./configInfo";

export function makeManualConfig(emailAddress: string, password: string): MailAccount {
  let domain = getDomainForEmailAddress(emailAddress)
  let config = new IMAPAccount();
  config.emailAddress = emailAddress;
  config.username = emailAddress;
  config.password = password;
  config.hostname = "replace-this." + domain;
  config.port = kStandardPorts.find(p => p.protocol == config.protocol && p.tls == TLSSocketType.TLS)?.port ?? 0;

  let outgoing = new SMTPAccount();
  outgoing.emailAddress = emailAddress;
  outgoing.username = emailAddress;
  outgoing.password = password;
  outgoing.hostname = "replace-this." + domain;
  outgoing.port = kStandardPorts.find(p => p.protocol == outgoing.protocol && p.tls == TLSSocketType.TLS)?.port ?? 0;

  config.outgoing = outgoing;
  return config;
}
