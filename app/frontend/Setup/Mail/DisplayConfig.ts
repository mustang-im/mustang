import type { MailAccount } from "../../../logic/Mail/MailAccount";
import { TLSSocketType } from "../../../logic/Mail/MailAccount";

export function noEncryption(tls: TLSSocketType): boolean {
  return tls != TLSSocketType.TLS && tls != TLSSocketType.STARTTLS;
}

export function socketLabel(tls: TLSSocketType): string {
  if (tls == TLSSocketType.TLS) {
    return "TLS";
  } else if (tls == TLSSocketType.STARTTLS) {
    return "STARTTLS";
  } else if (tls == TLSSocketType.Plain) {
    return "No encryption";
  } else {
    return "Unknown";
  }
}

export function portLabel(config: MailAccount) {
  return isStandardPort(config) ? "" : ":" + config.port;
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
];
