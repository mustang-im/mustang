// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../logic/app";
import { GlobalKeyAction, GlobalKeyboard } from "../../../frontend/MainWindow/GlobalKeyboard";
import { Keyboard } from "../../../frontend/Util/Keyboard";
import { expect, test } from "vitest";

function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent("keydown", { key, cancelable: true, bubbles: true, ...init });
}

function desktop(event: KeyboardEvent, isMac = false) {
  return GlobalKeyboard.actionFor(event, false, isMac);
}

test("Ctrl+1/2/3/4 switch to Mail, Calendar and People", () => {
  expect(desktop(press("1", { code: "Digit1", ctrlKey: true }))).toBe(GlobalKeyAction.Mail);
  expect(desktop(press("2", { code: "Digit2", ctrlKey: true }))).toBe(GlobalKeyAction.Calendar);
  expect(desktop(press("3", { code: "Digit3", ctrlKey: true }))).toBe(GlobalKeyAction.People);
  expect(desktop(press("4", { code: "Digit4", ctrlKey: true }))).toBe(GlobalKeyAction.People);
  expect(desktop(press("5", { code: "Digit5", ctrlKey: true }))).toBeNull();
  // AZERTY: the digit row types "&" etc. without Shift
  expect(desktop(press("&", { code: "Digit1", ctrlKey: true }))).toBe(GlobalKeyAction.Mail);
  // Cmd on macOS
  expect(desktop(press("2", { code: "Digit2", metaKey: true }), true)).toBe(GlobalKeyAction.Calendar);
  // Ctrl+Alt+digit is the calendar view switch, not the module switch
  expect(desktop(press("1", { code: "Digit1", ctrlKey: true, altKey: true }))).toBeNull();
});

test("Web build uses Ctrl+Shift+digit, like Outlook on the web", () => {
  let web = (event: KeyboardEvent) => GlobalKeyboard.actionFor(event, true, false);
  expect(web(press("1", { code: "Digit1", ctrlKey: true }))).toBeNull();
  expect(web(press("!", { code: "Digit1", ctrlKey: true, shiftKey: true }))).toBe(GlobalKeyAction.Mail);
  expect(web(press("@", { code: "Digit2", ctrlKey: true, shiftKey: true }))).toBe(GlobalKeyAction.Calendar);
  expect(desktop(press("!", { code: "Digit1", ctrlKey: true, shiftKey: true }))).toBeNull();
});

test("Ctrl+Shift+M/A/Q/C create new items from anywhere", () => {
  expect(desktop(press("M", { code: "KeyM", ctrlKey: true, shiftKey: true }))).toBe(GlobalKeyAction.NewMail);
  expect(desktop(press("A", { code: "KeyA", ctrlKey: true, shiftKey: true }))).toBe(GlobalKeyAction.NewEvent);
  expect(desktop(press("Q", { code: "KeyQ", ctrlKey: true, shiftKey: true }))).toBe(GlobalKeyAction.NewEvent);
  expect(desktop(press("C", { code: "KeyC", ctrlKey: true, shiftKey: true }))).toBe(GlobalKeyAction.NewContact);
  expect(desktop(press("B", { code: "KeyB", ctrlKey: true, shiftKey: true }))).toBe(GlobalKeyAction.AddressBook);
  // Ctrl+Shift+I stays Electron's DevTools
  expect(desktop(press("I", { code: "KeyI", ctrlKey: true, shiftKey: true }))).toBeNull();
  // Without Shift, Ctrl+M is Electron's Minimize
  expect(desktop(press("m", { code: "KeyM", ctrlKey: true }))).toBeNull();
});

test("Ctrl+Shift+B is not taken from text fields", () => {
  let editor = document.createElement("div");
  editor.setAttribute("contenteditable", "true");
  let paragraph = document.createElement("p");
  editor.append(paragraph);
  document.body.append(editor);
  let action: GlobalKeyAction | null = GlobalKeyAction.Search;
  paragraph.addEventListener("keydown", event => action = desktop(event));
  paragraph.dispatchEvent(press("B", { code: "KeyB", ctrlKey: true, shiftKey: true }));
  expect(action).toBeNull();
  editor.remove();
});

test("F3 and Alt+Q search, Alt+Q not on macOS", () => {
  expect(desktop(press("F3", { code: "F3" }))).toBe(GlobalKeyAction.Search);
  expect(desktop(press("F3", { code: "F3", shiftKey: true }))).toBeNull();
  expect(desktop(press("q", { code: "KeyQ", altKey: true }))).toBe(GlobalKeyAction.Search);
  expect(desktop(press("œ", { code: "KeyQ", altKey: true }), true)).toBeNull();
});

test("onKey consumes handled keys and leaves the others alone", async () => {
  let unhandled = press("x", { code: "KeyX", ctrlKey: true });
  await GlobalKeyboard.onKey(unhandled);
  expect(unhandled.defaultPrevented).toBe(false);

  let input = document.createElement("input");
  document.body.append(input);
  input.focus();
  let search = press("F3", { code: "F3" });
  let header = document.createElement("div");
  header.className = "window-header";
  header.innerHTML = `<div class="search-box"><input type="search"></div>`;
  document.body.append(header);
  await GlobalKeyboard.onKey(search);
  expect(search.defaultPrevented).toBe(true);
  expect(document.activeElement).toBe(header.querySelector("input"));

  let alreadyHandled = press("F3", { code: "F3" });
  alreadyHandled.preventDefault();
  input.focus();
  await GlobalKeyboard.onKey(alreadyHandled);
  expect(document.activeElement).toBe(input);
  header.remove();
  input.remove();
});

test("Keyboard.isTextField", () => {
  let input = document.createElement("input");
  let div = document.createElement("div");
  let notEditable = document.createElement("div");
  notEditable.setAttribute("contenteditable", "false");
  expect(Keyboard.isTextField(input)).toBe(true);
  expect(Keyboard.isTextField(div)).toBe(false);
  expect(Keyboard.isTextField(notEditable)).toBe(false);
  expect(Keyboard.isTextField(null)).toBe(false);
});
