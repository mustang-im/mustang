// @vitest-environment happy-dom
import { IdentitiesDraft } from "../../../../Settings/Mail/Account/IdentitiesDraft";
import { IMAPAccount } from "../../../../../logic/Mail/IMAP/IMAPAccount";
import { appGlobal } from "../../../../../logic/app";
import { beforeAll, expect, test } from "vitest";

beforeAll(() => {
  // IMAPAccount needs the backend's connection factory, but these tests never connect
  appGlobal.remoteApp ??= { createIMAPFlowConnection: () => null } as any;
});

function makeAccount(): { account: IMAPAccount, saved: string[] } {
  let saved: string[] = [];
  let account = new IMAPAccount();
  account.name = "Work";
  account.realname = "Fred";
  account.emailAddress = "fred@example.com";
  let identity = account.newIdentity();
  identity.realname = "Fred";
  identity.emailAddress = "fred@example.com";
  account.identities.add(identity);
  account.save = async () => { saved.push("account"); };
  return { account, saved };
}

test("Edits stay in the draft until saved", async () => {
  let { account, saved } = makeAccount();
  let draft = new IdentitiesDraft(account);
  expect(draft.isChanged).toBe(false);
  draft.identities[0].realname = "Fred Smith";
  draft.identities[0].replyTo = "office@example.com";
  expect(account.identities.first.realname).toBe("Fred");
  expect(draft.isChanged).toBe(true);
  await draft.save();
  expect(account.identities.first.realname).toBe("Fred Smith");
  expect(account.identities.first.replyTo).toBe("office@example.com");
  expect(account.realname).toBe("Fred Smith");
  expect(saved).toEqual([ "account" ]);
});

test("Add and remove identities; the last one stays", async () => {
  let { account } = makeAccount();
  let draft = new IdentitiesDraft(account);
  expect(draft.canRemove(draft.identities[0])).toBe(false);
  let alias = draft.add();
  expect(alias.realname).toBe("Fred");
  expect(draft.missingField).not.toBeNull();
  alias.emailAddress = "sales@example.com";
  expect(draft.missingField).toBeNull();
  await draft.save();
  expect(account.identities.contents.map(identity => identity.emailAddress)).toEqual([ "fred@example.com", "sales@example.com" ]);

  draft = new IdentitiesDraft(account);
  draft.remove(draft.identities[0]);
  expect(draft.identities.map(identity => identity.emailAddress)).toEqual([ "sales@example.com" ]);
  await draft.save();
  expect(account.identities.contents.map(identity => identity.emailAddress)).toEqual([ "sales@example.com" ]);
  expect(account.emailAddress).toBe("sales@example.com");
});

test("Catch-all addresses are valid", () => {
  let { account } = makeAccount();
  let draft = new IdentitiesDraft(account);
  draft.identities[0].emailAddress = "*@example.com";
  expect(draft.identities[0].isCatchAll).toBe(true);
  expect(draft.missingField).toBeNull();
  draft.identities[0].emailAddress = "not an address";
  expect(draft.missingField).toContain("not an address");
});
