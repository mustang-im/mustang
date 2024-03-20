import { TLSSocketType, type MailAccount } from "../../../../logic/Mail/MailAccount";
import { IMAPAccount } from "../../../../logic/Mail/IMAP/IMAPAccount";
import { SMTPAccount } from "../../../../logic/Mail/SMTP/SMTPAccount";
import { getDomainForEmailAddress } from "./fetchConfig";
import { kStandardPorts } from "../DisplayConfig";

export function makeManualConfig(emailAddress: string, password: string): MailAccount {
  let domain = getDomainForEmailAddress(emailAddress)
  let config = new IMAPAccount();
  config.emailAddress = emailAddress;
  config.username = emailAddress;
  config.password = password;
  config.hostname = "replace-this." + domain;
  config.port = kStandardPorts.find(p => p.protocol == config.protocol && p.tls == TLSSocketType.TLS).port;

  let outgoing = new SMTPAccount();
  outgoing.emailAddress = emailAddress;
  outgoing.username = emailAddress;
  outgoing.password = password;
  outgoing.hostname = "replace-this." + domain;
  outgoing.port = kStandardPorts.find(p => p.protocol == outgoing.protocol && p.tls == TLSSocketType.TLS).port;

  config.outgoing = outgoing;
  return config;
}
