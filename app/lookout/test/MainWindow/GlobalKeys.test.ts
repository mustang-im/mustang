import { GlobalKeyAction, GlobalKeys } from "../../MainWindow/GlobalKeys";
import { expect, test } from "vitest";

test("Ctrl+1 to Ctrl+4 switch the module, by key position", () => {
  expect(GlobalKeys.actionFor({ key: "1", code: "Digit1", ctrlKey: true })).toBe(GlobalKeyAction.Mail);
  expect(GlobalKeys.actionFor({ key: "2", code: "Digit2", ctrlKey: true })).toBe(GlobalKeyAction.Calendar);
  // Ctrl+3 was People in Outlook for 20 years, Ctrl+4 is People now
  expect(GlobalKeys.actionFor({ key: "3", code: "Digit3", ctrlKey: true })).toBe(GlobalKeyAction.People);
  expect(GlobalKeys.actionFor({ key: "4", code: "Digit4", ctrlKey: true })).toBe(GlobalKeyAction.People);
  expect(GlobalKeys.actionFor({ key: "1", code: "Numpad1", ctrlKey: true })).toBe(GlobalKeyAction.Mail);
  // AZERTY: the 1 key produces "&"
  expect(GlobalKeys.actionFor({ key: "&", code: "Digit1", ctrlKey: true })).toBe(GlobalKeyAction.Mail);
  expect(GlobalKeys.actionFor({ key: "1", code: "Digit1", metaKey: true })).toBe(GlobalKeyAction.Mail);
  expect(GlobalKeys.actionFor({ key: "5", code: "Digit5", ctrlKey: true })).toBeNull();
  expect(GlobalKeys.actionFor({ key: "1", code: "Digit1" })).toBeNull();
  // Ctrl+Alt+1 is the calendar's Day view, Ctrl+Shift+1 the web build's module key
  expect(GlobalKeys.actionFor({ key: "1", code: "Digit1", ctrlKey: true, altKey: true })).toBeNull();
  expect(GlobalKeys.actionFor({ key: "!", code: "Digit1", ctrlKey: true, shiftKey: true })).toBeNull();
});

test("New items from any module", () => {
  expect(GlobalKeys.actionFor({ key: "M", ctrlKey: true, shiftKey: true })).toBe(GlobalKeyAction.NewMail);
  expect(GlobalKeys.actionFor({ key: "A", ctrlKey: true, shiftKey: true })).toBe(GlobalKeyAction.NewAppointment);
  expect(GlobalKeys.actionFor({ key: "Q", ctrlKey: true, shiftKey: true })).toBe(GlobalKeyAction.NewMeeting);
  expect(GlobalKeys.actionFor({ key: "C", ctrlKey: true, shiftKey: true })).toBe(GlobalKeyAction.NewContact);
  expect(GlobalKeys.actionFor({ key: "L", ctrlKey: true, shiftKey: true })).toBe(GlobalKeyAction.NewContactGroup);
  expect(GlobalKeys.actionFor({ key: "B", ctrlKey: true, shiftKey: true })).toBe(GlobalKeyAction.AddressBook);
  // Ctrl+Shift+I is the DevTools key of Electron and the browser, not Go to Inbox
  expect(GlobalKeys.actionFor({ key: "I", ctrlKey: true, shiftKey: true })).toBeNull();
  expect(GlobalKeys.actionFor({ key: "M", ctrlKey: true, shiftKey: true, altKey: true })).toBeNull();
});

test("Search and Tell me", () => {
  expect(GlobalKeys.actionFor({ key: "F3" })).toBe(GlobalKeyAction.Search);
  expect(GlobalKeys.actionFor({ key: "e", ctrlKey: true })).toBe(GlobalKeyAction.Search);
  expect(GlobalKeys.actionFor({ key: "F3", shiftKey: true })).toBeNull();
  expect(GlobalKeys.actionFor({ key: "q", code: "KeyQ", altKey: true }, false)).toBe(GlobalKeyAction.TellMe);
  // Option+Q types "œ" on macOS
  expect(GlobalKeys.actionFor({ key: "œ", code: "KeyQ", altKey: true }, true)).toBeNull();
});

test("Plain keys and other combinations are left to the pages", () => {
  expect(GlobalKeys.actionFor({ key: "a" })).toBeNull();
  expect(GlobalKeys.actionFor({ key: "n", ctrlKey: true })).toBeNull();
  expect(GlobalKeys.actionFor({ key: "Delete" })).toBeNull();
  expect(GlobalKeys.actionFor({ key: "Escape" })).toBeNull();
});
