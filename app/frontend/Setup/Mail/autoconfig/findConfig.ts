import { TLSSocketType, type MailAccount } from "../../../../logic/Mail/MailAccount";
import { IMAPAccount } from "../../../../logic/Mail/IMAP/IMAPAccount";
import { SMTPAccount } from "../../../../logic/Mail/SMTP/SMTPAccount";
import { fetchConfig, getDomainForEmailAddress } from "./fetchConfig";
import type { ArrayColl } from "svelte-collections";
import { kStandardPorts } from "../DisplayConfig";

export async function findConfig(emailAddress: string, password: string): Promise<ArrayColl<MailAccount>> {
  let domain = getDomainForEmailAddress(emailAddress);
  return await fetchConfig(domain, emailAddress);
}

export function makeManualConfig(emailAddress: string, password: string): MailAccount {
  let domain = getDomainForEmailAddress(emailAddress)
  let config = new IMAPAccount();
  config.emailAddress = emailAddress;
  config.username = emailAddress;
  config.hostname = "replace-this." + domain;
  config.port = kStandardPorts.find(p => p.protocol == config.protocol && p.tls == TLSSocketType.TLS).port;

  let outgoing = new SMTPAccount();
  outgoing.emailAddress = emailAddress;
  outgoing.username = emailAddress;
  outgoing.hostname = "replace-this." + domain;
  outgoing.port = kStandardPorts.find(p => p.protocol == outgoing.protocol && p.tls == TLSSocketType.TLS).port;

  config.outgoing = outgoing;
  return config;
}
