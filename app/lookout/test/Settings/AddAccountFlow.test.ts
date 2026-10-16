// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../logic/app";
import { AddAccountFlow, AddAccountStep } from "../../Settings/Accounts/AddAccountFlow";
import { IMAPAccount } from "../../../logic/Mail/IMAP/IMAPAccount";
import type { MailAccount } from "../../../logic/Mail/MailAccount";
import { AuthMethod } from "../../../logic/Abstract/Account";
import { beforeAll, beforeEach, expect, test, vi } from "vitest";

// No network: no configuration is found for any domain
vi.mock("../../../logic/Mail/AutoConfig/findConfig", () => ({ findConfig: async () => undefined }));
// No server: every configuration works, and saving only records the account
const saved: string[] = [];
vi.mock("../../../logic/Mail/AutoConfig/checkConfig", () => ({ checkConfig: async () => {} }));
vi.mock("../../../logic/Mail/AutoConfig/saveConfig", () => ({
  fillConfig: () => {},
  saveAndInitConfig: async (config: MailAccount, emailAddress: string, password: string) => { saved.push(`${emailAddress} ${password}`); },
}));

beforeAll(() => {
  // IMAPAccount and POP3Account need the backend's connection factories, but these tests never connect
  appGlobal.remoteApp ??= { createIMAPFlowConnection: () => null, newTCPSocket: () => null } as any;
});

test("The email address must be valid before connecting", () => {
  let flow = new AddAccountFlow();
  flow.emailAddress = "fred";
  expect(flow.isEMailAddressValid).toBe(false);
  flow.emailAddress = " fred@example.org ";
  expect(flow.isEMailAddressValid).toBe(true);
  expect(flow.domain).toBe("example.org");
});

test("Manual setup starts with an IMAP account and an SMTP server for the address", async () => {
  let flow = new AddAccountFlow();
  flow.emailAddress = "fred@example.org";
  flow.isManual = true;
  await flow.connect(async () => false);
  expect(flow.step).toBe(AddAccountStep.Manual);
  expect(flow.config.protocol).toBe("imap");
  expect(flow.draft.emailAddress).toBe("fred@example.org");
  expect(flow.draft.incoming.username).toBe("fred@example.org");
  expect(flow.draft.outgoing).toBeTruthy();
  expect(flow.notice).toBe(null);
});

test("Switching to POP keeps the entered server and logon, and takes the POP port", () => {
  let flow = new AddAccountFlow();
  flow.emailAddress = "fred@example.org";
  flow.startManual(null);
  flow.draft.realname = "Fred";
  flow.draft.incoming.hostname = "mail.example.org";
  flow.draft.incoming.password = "secret";
  flow.draft.outgoing.hostname = "smtp.example.org";
  flow.setAccountType("pop3");
  expect(flow.config.protocol).toBe("pop3");
  expect(flow.draft.realname).toBe("Fred");
  expect(flow.draft.incoming.hostname).toBe("mail.example.org");
  expect(flow.draft.incoming.password).toBe("secret");
  expect(flow.draft.incoming.port).toBe(995);
  expect(flow.draft.outgoing.hostname).toBe("smtp.example.org");
});

test("Without settings found, the password is asked for and the search repeated, then manual setup", async () => {
  let flow = new AddAccountFlow();
  flow.emailAddress = "fred@example.org";
  await flow.connect(async () => false);
  expect(flow.step).toBe(AddAccountStep.Password);
  expect(flow.config).toBe(null);
  expect(flow.notice).toBeTruthy();
  flow.password = "secret";
  await flow.submitPassword(async () => false);
  expect(flow.step).toBe(AddAccountStep.Manual);
  expect(flow.draft.incoming.password).toBe("secret");
  expect(flow.notice).toContain("example.org");
});

test("Manual setup of an Exchange account takes a server URL instead of the mail servers", () => {
  let flow = new AddAccountFlow();
  flow.emailAddress = "fred@example.org";
  flow.startManual(null);
  flow.draft.outgoing.hostname = "smtp.example.org";
  flow.setAccountType("ews");
  expect(flow.usesURL).toBe(true);
  expect(flow.draft.outgoing).toBe(null);
  expect(flow.draft.incoming.url).toBe("https://mail.example.org/EWS/Exchange.asmx");
  expect(flow.draft.incoming.username).toBe("fred@example.org");
  flow.setAccountType("imap");
  expect(flow.usesURL).toBe(false);
  expect(flow.draft.outgoing.hostname).toBe("smtp.example.org");
});

function importedAccount(emailAddress: string): MailAccount {
  let account = new IMAPAccount();
  account.name = emailAddress;
  account.emailAddress = emailAddress;
  account.hostname = "imap.example.org";
  account.authMethod = AuthMethod.Password;
  return account;
}

beforeEach(() => {
  saved.length = 0;
});

test("Imported accounts ask for the password of each one, Skip goes on, and Done lists the added ones", async () => {
  let anna = importedAccount("anna@example.org");
  let bert = importedAccount("bert@example.org");
  let cleo = importedAccount("cleo@example.org");
  let flow = new AddAccountFlow([anna, bert, cleo]);
  expect(flow.isPrepared).toBe(true);
  expect(flow.step).toBe(AddAccountStep.Password);
  expect(flow.emailAddress).toBe("anna@example.org");
  expect(flow.remainingPrepared).toBe(2);
  expect([flow.preparedNumber, flow.preparedCount]).toEqual([1, 3]);

  flow.password = "anna-secret";
  await flow.submitPassword(async () => false);
  expect(flow.step).toBe(AddAccountStep.Password);
  expect(flow.config).toBe(bert);
  expect(flow.password).toBe("");

  flow.skip();
  expect(flow.config).toBe(cleo);
  flow.password = "cleo-secret";
  await flow.submitPassword(async () => false);
  expect(flow.step).toBe(AddAccountStep.Done);
  expect(flow.added).toEqual([anna, cleo]);
  expect(saved).toEqual(["anna@example.org anna-secret", "cleo@example.org cleo-secret"]);
});

test("Skipping all imported accounts goes to the email address page", () => {
  let flow = new AddAccountFlow([importedAccount("anna@example.org")]);
  flow.skip();
  expect(flow.step).toBe(AddAccountStep.EMailAddress);
  expect(flow.isPrepared).toBe(false);
  expect(flow.emailAddress).toBe("");
  expect(flow.added).toEqual([]);
});

test("A predefined account with a password keeps it, and an OAuth2 account starts with the sign-in", () => {
  let predefined = importedAccount("anna@example.org");
  predefined.password = "from-admin";
  expect(new AddAccountFlow([predefined]).password).toBe("from-admin");

  let oAuth2 = importedAccount("bert@example.org");
  oAuth2.authMethod = AuthMethod.OAuth2;
  oAuth2.oAuth2 = {} as any;
  expect(new AddAccountFlow([oAuth2]).step).toBe(AddAccountStep.Login);
});

test("A manually added account also ends on the Done page with that account", async () => {
  let flow = new AddAccountFlow();
  flow.emailAddress = "fred@example.org";
  flow.startManual(null);
  flow.draft.realname = "Fred";
  flow.draft.incoming.hostname = "mail.example.org";
  flow.draft.incoming.password = "secret";
  flow.draft.outgoing.hostname = "smtp.example.org";
  await flow.finish();
  expect(flow.step).toBe(AddAccountStep.Done);
  expect(flow.added).toEqual([flow.config]);
});
