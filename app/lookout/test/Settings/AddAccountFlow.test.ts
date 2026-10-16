// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../logic/app";
import { AddAccountFlow, AddAccountStep } from "../../Settings/Accounts/AddAccountFlow";
import { beforeAll, expect, test, vi } from "vitest";

// No network: no configuration is found for any domain
vi.mock("../../../logic/Mail/AutoConfig/findConfig", () => ({ findConfig: async () => undefined }));

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
