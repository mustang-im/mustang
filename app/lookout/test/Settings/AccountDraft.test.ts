// @vitest-environment happy-dom
import { AccountDraft, StandardPorts } from "../../Settings/Accounts/AccountDraft";
import { IMAPAccount } from "../../../logic/Mail/IMAP/IMAPAccount";
import { SMTPAccount } from "../../../logic/Mail/SMTP/SMTPAccount";
import { AuthMethod } from "../../../logic/Abstract/Account";
import { TLSSocketType } from "../../../logic/Abstract/TCPAccount";
import { appGlobal } from "../../../logic/app";
import { beforeAll, expect, test } from "vitest";

beforeAll(() => {
  // IMAPAccount needs the backend's connection factory, but these tests never connect
  appGlobal.remoteApp ??= { createIMAPFlowConnection: () => null } as any;
});

function makeIMAPAccount(): { account: IMAPAccount, saved: string[] } {
  let saved: string[] = [];
  let account = new IMAPAccount();
  account.name = "Work";
  account.emailAddress = "fred@example.com";
  account.realname = "Fred";
  account.hostname = "imap.example.com";
  account.port = 993;
  account.tls = TLSSocketType.TLS;
  account.username = "fred";
  account.password = "secret";
  account.authMethod = AuthMethod.Password;
  account.save = async () => { saved.push("imap"); };
  let smtp = new SMTPAccount();
  smtp.hostname = "smtp.example.com";
  smtp.port = 587;
  smtp.tls = TLSSocketType.STARTTLS;
  smtp.authMethod = AuthMethod.Password;
  smtp.save = async () => { saved.push("smtp"); };
  account.outgoing = smtp;
  return { account, saved };
}

test("The draft doesn't touch the account before OK", () => {
  let { account } = makeIMAPAccount();
  let draft = new AccountDraft(account);
  draft.name = "Private";
  draft.incoming.hostname = "mail.example.org";
  expect(account.name).toBe("Work");
  expect(account.hostname).toBe("imap.example.com");
});

test("Saving the draft writes incoming and outgoing server and saves both accounts", async () => {
  let { account, saved } = makeIMAPAccount();
  let draft = new AccountDraft(account);
  expect(draft.isMailAccount).toBe(true);
  expect(draft.incoming.usesHostname).toBe(true);
  expect(draft.outgoing.usesHostname).toBe(true);
  draft.name = " Private ";
  draft.emailAddress = "fred@example.org";
  draft.incoming.hostname = "mail.example.org";
  draft.outgoing.hostname = "smtp.example.org";
  draft.outgoing.authMethod = AuthMethod.None;
  await draft.save();
  expect(account.name).toBe("Private");
  expect(account.emailAddress).toBe("fred@example.org");
  expect(account.hostname).toBe("mail.example.org");
  expect(account.outgoing.hostname).toBe("smtp.example.org");
  expect(account.outgoing.authMethod).toBe(AuthMethod.None);
  expect(account.password).toBe("secret");
  expect(saved).toEqual(["imap", "smtp"]);
});

test("A missing server name or email address keeps OK disabled", () => {
  let { account } = makeIMAPAccount();
  let draft = new AccountDraft(account);
  expect(draft.missingField).toBe(null);
  draft.incoming.hostname = " ";
  expect(draft.missingField).toBe("server");
  draft.incoming.hostname = "imap.example.com";
  draft.emailAddress = "";
  expect(draft.missingField).toBe("emailAddress");
});

test("Standard ports follow the encryption, custom ports stay", () => {
  expect(StandardPorts.portFor("imap", TLSSocketType.TLS)).toBe(993);
  expect(StandardPorts.portFor("smtp", TLSSocketType.STARTTLS)).toBe(587);
  expect(StandardPorts.afterTLSChange("imap", TLSSocketType.STARTTLS, 993)).toBe(143);
  expect(StandardPorts.afterTLSChange("smtp", TLSSocketType.TLS, 587)).toBe(465);
  expect(StandardPorts.afterTLSChange("imap", TLSSocketType.STARTTLS, 1143)).toBe(1143);
  expect(StandardPorts.afterTLSChange("imap", TLSSocketType.TLS, null)).toBe(993);
});
