// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { MailAccount } from "../../../../logic/Mail/MailAccount";
import { Folder, SpecialFolder } from "../../../../logic/Mail/Folder";
import type { EMail } from "../../../../logic/Mail/EMail";
import { DummyMailStorage } from "../../../../logic/Mail/Store/DummyMailStorage";
import { findOrCreatePersonUID } from "../../../../logic/Abstract/PersonUID";
import { AppWindow } from "../../../../frontend/MainWindow/AppWindow";
import { selectedMessage } from "../../../../frontend/Mail/Selected";
import { getLocalStorage } from "../../../../frontend/Util/LocalStorage";
// The window that the pop-out buttons open, in both frontends
import MessageWindow from "../../../../frontend/Mail/Message/MessageWindow.svelte";
import { flushSync, mount, unmount } from "svelte";
import { get } from "svelte/store";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";

beforeAll(async () => {
  (globalThis as any).ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  // Loading the Lookout window takes longer than a test waits for it
  await import("../../../Mail/Message/MessageWindow.svelte");
}, 60000);

const frontend = getLocalStorage("appearance.frontend", "classic");
let inbox: Folder;
let message: EMail;
let appWindow: AppWindow;
let app: Record<string, any> | null = null;

beforeEach(() => {
  appGlobal.remoteApp = {} as any;
  let account = new MailAccount();
  account.name = "Test";
  account.emailAddress = "user@example.com";
  account.storage = new DummyMailStorage();
  inbox = new Folder(account);
  inbox.name = "INBOX";
  inbox.specialFolder = SpecialFolder.Inbox;
  account.rootFolders.add(inbox);
  message = inbox.newEMail();
  message.id = "msg@example.com";
  message.subject = "Lunch on Friday";
  message.isRead = true;
  message.sent = new Date(2026, 8, 1, 12);
  message.received = message.sent;
  message.from = findOrCreatePersonUID("alice@example.com", "Alice");
  message.contact = message.from;
  message.loadBody = async () => {};
  inbox.messages.add(message);
  // happy-dom has only one window, so the email window shares the test's window and document
  appWindow = new (AppWindow as any)(window, "test-window", AppWindow.main);
  vi.spyOn(appWindow, "close").mockReturnValue();
});

afterEach(() => {
  unmount(app);
  app = null;
  document.body.innerHTML = "";
  frontend.value = "classic";
  vi.restoreAllMocks();
});

function openWindow() {
  let target = document.createElement("div");
  document.body.append(target);
  app = mount(MessageWindow, { target, props: { message }, context: new Map([["appWindow", appWindow]]) });
  flushSync();
}

test("In Lookout, the email window has the Lookout frame and shows the email", async () => {
  frontend.value = "lookout";
  openWindow();
  await vi.waitFor(() => expect(document.querySelector(".lookout-window")).toBeTruthy());
  expect(document.title).toBe("Lunch on Friday");
  expect(document.querySelector(".lookout-window").textContent).toContain("Alice");
});

test("In Lookout, the email window selects its email only in its own window", async () => {
  let mainSelection = get(selectedMessage);
  frontend.value = "lookout";
  openWindow();
  await vi.waitFor(() => expect(document.querySelector(".lookout-window")).toBeTruthy());
  expect(get(appWindow.uiState(selectedMessage))).toBe(message);
  expect(get(AppWindow.main.uiState(selectedMessage))).toBe(mainSelection);
});

test("In Lookout, the email window closes when its email is deleted or moved", async () => {
  frontend.value = "lookout";
  openWindow();
  await vi.waitFor(() => expect(document.querySelector(".lookout-window")).toBeTruthy());
  expect(appWindow.close).not.toHaveBeenCalled();
  inbox.messages.remove(message);
  expect(appWindow.close).toHaveBeenCalledTimes(1);
});

test("In the classic frontend, the email window keeps the classic frame", async () => {
  openWindow();
  await vi.waitFor(() => expect(document.querySelector(".secondary-window")).toBeTruthy());
  expect(document.querySelector(".lookout-window")).toBeNull();
  expect(document.title).toBe("Lunch on Friday");
});
