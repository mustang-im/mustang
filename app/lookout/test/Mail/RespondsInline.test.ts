// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../logic/app";
import type { EMail } from "../../../logic/Mail/EMail";
import { MessageActions } from "../../Mail/MessageActions";
import { selectedMessage, selectedMessages } from "../../../frontend/Mail/Selected";
import { selectedApp } from "../../../frontend/AppsBar/selectedApp";
import { mailMustangApp } from "../../../frontend/Mail/MailMustangApp";
import { AppWindow } from "../../../frontend/MainWindow/AppWindow";
import { ArrayColl } from "svelte-collections";
import { afterEach, expect, test } from "vitest";

afterEach(() => {
  AppWindow["acting"] = null;
});

test("Replies are inline in the main window, but not in the window of a single email", () => {
  // Stands in for the email window. `acting` is what `AppWindow.current()` returns first.
  class EMailWindow extends AppWindow {
    constructor() {
      super(window, "email", AppWindow.main);
    }
  }
  let message = { subject: "Shown" } as EMail;
  selectedApp.set(mailMustangApp);
  selectedMessage.set(message);
  selectedMessages.set(new ArrayColl([message]));
  expect(MessageActions.respondsInline(message)).toBe(true);

  let emailWindow = new EMailWindow();
  emailWindow.uiState(selectedMessage).set(message);
  emailWindow.uiState(selectedMessages).set(new ArrayColl([message]));
  AppWindow["acting"] = emailWindow;
  expect(MessageActions.respondsInline(message)).toBe(false);
});
