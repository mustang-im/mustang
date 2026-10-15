import type { Account } from "../../../logic/Abstract/Account";
import { AuthMethod } from "../../../logic/Abstract/Account";
import { TCPAccount, TLSSocketType } from "../../../logic/Abstract/TCPAccount";
import { MailAccount } from "../../../logic/Mail/MailAccount";
import { kStandardPorts } from "../../../logic/Mail/AutoConfig/configInfo";

export class StandardPorts {
  static portFor(protocol: string, tls: TLSSocketType): number | null {
    return kStandardPorts.find(standard => standard.protocol == protocol && standard.tls == tls)?.port ?? null;
  }

  static afterTLSChange(protocol: string, tls: TLSSocketType, currentPort: number | null): number | null {
    let isStandardPort = kStandardPorts.some(standard => standard.protocol == protocol && standard.port == currentPort);
    if (currentPort && !isStandardPort) {
      return currentPort;
    }
    return StandardPorts.portFor(protocol, tls) ?? currentPort;
  }
}

export class ServerDraft {
  readonly account: Account;
  hostname: string;
  port: number;
  tls: TLSSocketType;
  url: string;
  username: string;
  password: string;
  authMethod: AuthMethod;

  constructor(account: Account) {
    this.account = account;
    if (account instanceof TCPAccount) {
      this.hostname = account.hostname ?? "";
      this.port = account.port;
      this.tls = account.tls;
    }
    this.url = account.url ?? "";
    this.username = account.username ?? "";
    this.password = account.password ?? "";
    this.authMethod = account.authMethod;
  }

  get protocol(): string {
    return this.account.protocol;
  }

  get usesHostname(): boolean {
    return this.account instanceof TCPAccount && ["imap", "pop3", "smtp"].includes(this.protocol);
  }

  get needsLogin(): boolean {
    return this.authMethod != AuthMethod.None && this.authMethod != AuthMethod.OAuth2;
  }

  apply() {
    let account = this.account;
    if (account instanceof TCPAccount && this.usesHostname) {
      account.hostname = this.hostname.trim();
      account.port = this.port;
      account.tls = this.tls;
    } else if (this.url != (account.url ?? "")) {
      account.url = this.url.trim();
    }
    if (this.username != (account.username ?? "")) {
      account.username = this.username.trim();
    }
    if (this.password != (account.password ?? "")) {
      account.password = this.password;
    }
    account.authMethod = this.authMethod;
  }
}

export class AccountDraft {
  readonly account: Account;
  name: string;
  realname: string;
  emailAddress: string;
  readonly incoming: ServerDraft;
  readonly outgoing: ServerDraft | null;

  constructor(account: Account) {
    this.account = account;
    this.name = account.name ?? "";
    this.realname = account.realname ?? "";
    this.emailAddress = account instanceof MailAccount ? account.emailAddress ?? "" : "";
    this.incoming = new ServerDraft(account);
    this.outgoing = account instanceof MailAccount && account.outgoing
      ? new ServerDraft(account.outgoing)
      : null;
  }

  get isMailAccount(): boolean {
    return this.account instanceof MailAccount;
  }

  get hasServer(): boolean {
    return this.incoming.usesHostname || !!this.account.url;
  }

  get missingField(): string | null {
    if (!this.name.trim()) {
      return "name";
    }
    if (this.isMailAccount && !this.emailAddress.trim()) {
      return "emailAddress";
    }
    for (let server of [this.incoming, this.outgoing]) {
      if (server?.usesHostname && (!server.hostname.trim() || !server.port)) {
        return "server";
      }
    }
    return null;
  }

  async save() {
    let account = this.account;
    account.name = this.name.trim();
    account.realname = this.realname.trim();
    if (account instanceof MailAccount) {
      account.emailAddress = this.emailAddress.trim();
    }
    this.incoming.apply();
    this.outgoing?.apply();
    await account.save();
    if (account instanceof MailAccount && account.outgoing && this.outgoing) {
      await account.outgoing.save();
    }
  }
}
