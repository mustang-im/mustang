// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../logic/app";
import { MailAccount } from "../../../logic/Mail/MailAccount";
import { Folder, SpecialFolder } from "../../../logic/Mail/Folder";
import { DummyMailStorage } from "../../../logic/Mail/Store/DummyMailStorage";
import { selectedAccount, selectedFolder } from "../../../frontend/Mail/Selected";
import MailApp from "../../../frontend/Mail/MailApp.svelte";
import { flushSync, mount } from "svelte";
import { get } from "svelte/store";
import { beforeAll, expect, test } from "vitest";

beforeAll(() => {
  (globalThis as any).ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function newTestAccount(name: string, folderNames: string[]): MailAccount {
  appGlobal.remoteApp = {} as any;
  let account = new MailAccount();
  account.name = name;
  account.emailAddress = `${name}@example.com`;
  account.storage = new DummyMailStorage();
  for (let folderName of folderNames) {
    let folder = new Folder(account);
    folder.name = folderName;
    folder.id = `${name}-${folderName}`;
    if (folderName == "Inbox") {
      folder.specialFolder = SpecialFolder.Inbox;
    } else if (folderName == "Sent") {
      folder.specialFolder = SpecialFolder.Sent;
    }
    account.rootFolders.add(folder);
  }
  return account;
}

function newSubFolder(parent: Folder, name: string): Folder {
  let folder = new Folder(parent.account);
  folder.name = name;
  folder.id = parent.id + "-" + name;
  folder.parent = parent;
  parent.subFolders.add(folder);
  return folder;
}

function shownFolderNames(target: HTMLElement): string[] {
  return [...target.querySelectorAll(".folder-list .row")].map(rowE => rowE.textContent.trim());
}

test("Switching the account lists only the folders of the new account", () => {
  let accountA = newTestAccount("A", ["Inbox", "Sent", "Parent"]);
  let subFolder = newSubFolder(accountA.rootFolders.find(folder => folder.name == "Parent"), "Subfolder");
  // More folders than account A, so that the old list position picks the wrong one
  let accountB = newTestAccount("B", ["Inbox", "Sent", "Archive", "Drafts", "Spam"]);
  appGlobal.emailAccounts.addAll([accountA, accountB]);

  selectedAccount.set(accountA);
  selectedFolder.set(subFolder);
  let target = document.createElement("div");
  document.body.append(target);
  mount(MailApp, { target });
  flushSync();
  expect(shownFolderNames(target)[0]).toEqual("Inbox");

  selectedAccount.set(accountB);
  flushSync();
  // The subfolder of account A was listed above the inbox of account B
  expect(shownFolderNames(target)).not.toContain("Subfolder");
  expect(shownFolderNames(target)[0]).toEqual("Inbox");
});
