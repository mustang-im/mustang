// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { MailAccount } from "../../../../logic/Mail/MailAccount";
import { Folder, SpecialFolder } from "../../../../logic/Mail/Folder";
import type { EMail } from "../../../../logic/Mail/EMail";
import { DummyMailStorage } from "../../../../logic/Mail/Store/DummyMailStorage";
import { findOrCreatePersonUID } from "../../../../logic/Abstract/PersonUID";
import { sleep } from "../../../../logic/util/util";
import { selectedMessage } from "../../../../frontend/Mail/Selected";
import MessageMovePopup from "../../../../frontend/Mail/Message/MessageMovePopup.svelte";
import { flushSync, mount } from "svelte";
import { ArrayColl } from "svelte-collections";
import { get } from "svelte/store";
import { beforeAll, expect, test } from "vitest";

beforeAll(() => {
  (globalThis as any).ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

let movedOnServer: EMail[] = [];

function newTestAccount(): MailAccount {
  appGlobal.remoteApp = {} as any;
  let account = new MailAccount();
  account.name = "Test";
  account.emailAddress = "user@example.com";
  account.storage = new DummyMailStorage();
  account.contentStorage.clear();
  let inbox = new Folder(account);
  inbox.name = "INBOX";
  inbox.id = "INBOX";
  inbox.specialFolder = SpecialFolder.Inbox;
  account.rootFolders.add(inbox);
  let target = new Folder(account);
  target.name = "Target";
  target.id = "Target";
  (target as any).moveOrCopyMessagesOnServer = async function(action: string, messages: ArrayColl<EMail>) {
    movedOnServer.push(...messages.contents);
  };
  account.rootFolders.add(target);
  let email = inbox.newEMail();
  email.id = "msg@example.com";
  email.pID = email.id;
  email.subject = "Test";
  email.sent = new Date(2026, 8, 1, 12, 0);
  email.received = email.sent;
  email.from = findOrCreatePersonUID("alice@example.com", "Alice");
  email.contact = email.from;
  inbox.messages.add(email);
  return account;
}

test("Moving the only message out of the inbox shows no message, not an empty one", async () => {
  let account = newTestAccount();
  let inbox = account.inbox;
  let email = inbox.messages.first;
  movedOnServer = [];
  selectedMessage.set(email);

  let target = document.createElement("div");
  document.body.append(target);
  mount(MessageMovePopup, { target, props: { messages: new ArrayColl([email]) } });
  flushSync();

  let moveButton = [...target.querySelectorAll("button")]
    .find(button => button.title == "Move this email to folder Target");
  moveButton.click();
  await sleep(0); // the click handler is `async`, and we get no promise

  expect(movedOnServer.map(msg => msg.subject)).toEqual(["Test"]);
  expect(inbox.messages.isEmpty).toBe(true);
  // Not a new, empty email: It has no sender and no server ID, so it shows
  // "unknown@invalid" and the server rejects the ID as malformed.
  expect(get(selectedMessage)).toBeNull();
});
