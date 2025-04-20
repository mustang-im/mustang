import type { MailAccount } from "../MailAccount";
import { TLSSocketType } from "../../Abstract/TCPAccount";
import type { URLString } from "../../util/util";

export function hasEncryption(tls: TLSSocketType): boolean {
  return tls == TLSSocketType.TLS || tls == TLSSocketType.STARTTLS;
}

export function isStandardPort(config: MailAccount) {
  return !!kStandardPorts.find(p =>
    config.protocol == p.protocol && config.tls == p.tls && config.port == p.port);
}

export const kStandardPorts = [
  { protocol: "imap", tls: TLSSocketType.TLS, port: 993 },
  { protocol: "imap", tls: TLSSocketType.STARTTLS, port: 143 },
  { protocol: "imap", tls: TLSSocketType.Plain, port: 143 },
  { protocol: "pop3", tls: TLSSocketType.TLS, port: 995 },
  { protocol: "pop3", tls: TLSSocketType.STARTTLS, port: 110 },
  { protocol: "pop3", tls: TLSSocketType.Plain, port: 110 },
  { protocol: "smtp", tls: TLSSocketType.TLS, port: 465 },
  { protocol: "smtp", tls: TLSSocketType.STARTTLS, port: 587 },
  { protocol: "smtp", tls: TLSSocketType.Plain, port: 587 },
  { protocol: "smtp", tls: TLSSocketType.STARTTLS, port: 25 },
  { protocol: "smtp", tls: TLSSocketType.Plain, port: 25 },
  { protocol: "jmap", tls: TLSSocketType.TLS, port: 443 },
  { protocol: "ews", tls: TLSSocketType.TLS, port: 443 },
  { protocol: "activesync", tls: TLSSocketType.TLS, port: 443 },
  { protocol: "owa", tls: TLSSocketType.TLS, port: 443 },
];

export function getStandardURL(protocol: string, domain: string): URLString {
  if (protocol == "jmap") {
    return `https://${domain}/.well-known/jmap`;
  } else if (protocol == "ews") {
    return `https://mail.${domain}/EWS/Exchange.asmx`;
  } else if (protocol == "owa") {
    return `https://mail.${domain}/owa/`;
  } else if (protocol == "activesync") {
    return `https://mail.${domain}/Microsoft-Server-ActiveSync`;
  } else if (protocol == "graph") {
    return `https://graph.microsoft.com`;
  } else {
    return "";
  }
}
