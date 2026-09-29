// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { MailAccount } from "../../../../logic/Mail/MailAccount";
import { AutoResponder, AutoResponderAudience } from "../../../../logic/Mail/AutoResponder";
import AutoResponderPage from "../../../../frontend/Settings/Mail/AutoResponder.svelte";
import { flushSync, mount, tick, unmount } from "svelte";
import { afterEach, beforeAll, expect, test } from "vitest";

beforeAll(() => {
  appGlobal.remoteApp = {} as any;
});

/** What the server has */
class TestAutoResponder extends AutoResponder {
  saved = 0;

  get supported() {
    return true;
  }
  get supportsExternal() {
    return true;
  }
  get supportsContacts() {
    return true;
  }

  async load() {
    this.enabled = true;
    this.scheduled = true;
    this.internalHTML = "<p>Back on Monday</p>";
    this.externalAudience = AutoResponderAudience.None;
    this.maxAudience = AutoResponderAudience.Contacts;
  }

  async save() {
    this.saved++;
  }
}

class TestMailAccount extends MailAccount {
  newAutoResponder() {
    return new TestAutoResponder(this);
  }
}

let target: HTMLElement;
let app: any;

afterEach(() => {
  unmount(app);
  target.remove();
});

async function showPage(): Promise<TestAutoResponder> {
  let account = new TestMailAccount();
  target = document.createElement("div");
  document.body.append(target);
  app = mount(AutoResponderPage, { target, props: { account } });
  await tick(); // `load()`
  flushSync();
  return account.autoResponder as TestAutoResponder;
}

function radio(label: string): HTMLInputElement {
  let found = [...target.querySelectorAll("label.radio")]
    .filter(el => el.textContent.trim() == label);
  expect(found.length, `radio ${label}`).toBe(1);
  return found[0].querySelector("input");
}

function click(el: HTMLElement) {
  el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  flushSync();
}

test("Shows the settings from the server", async () => {
  await showPage();

  expect(radio("Send automatic replies").checked).toBe(true);
  expect(target.querySelectorAll("input[type=date]").length).toBe(2);
  expect(target.textContent).toContain("Back on Monday");
  expect(radio("Don't reply").checked).toBe(true);
  expect(radio("Only to my contacts").disabled).toBe(false);
  // The admin allows only contacts
  expect(radio("Anyone outside my organization").disabled).toBe(true);
});

test("Turning it off hides the messages, and saves", async () => {
  let autoResponder = await showPage();

  click(radio("Don't send automatic replies"));
  expect(autoResponder.enabled).toBe(false);
  expect(target.textContent).not.toContain("Back on Monday");
  expect(target.textContent).not.toContain("Outside my organization");

  click([...target.querySelectorAll("button")].find(el => el.textContent.includes("Save")));
  await tick();
  expect(autoResponder.saved).toBe(1);
});

test("Replying to contacts outside shows their message", async () => {
  let autoResponder = await showPage();

  click(radio("Only to my contacts"));
  expect(autoResponder.externalAudience).toBe(AutoResponderAudience.Contacts);
  expect(target.querySelectorAll(".html-editor").length).toBe(2);
});
