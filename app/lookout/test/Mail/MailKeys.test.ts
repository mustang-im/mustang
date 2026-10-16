import { MailKeyAction, MailKeys } from "../../Mail/MailKeys";
import { expect, test } from "vitest";

test("Outlook keys for replying and forwarding", () => {
  expect(MailKeys.actionFor({ key: "r", ctrlKey: true })).toBe(MailKeyAction.Reply);
  // With Shift, the browser reports the uppercase letter
  expect(MailKeys.actionFor({ key: "R", ctrlKey: true, shiftKey: true })).toBe(MailKeyAction.ReplyAll);
  expect(MailKeys.actionFor({ key: "f", ctrlKey: true })).toBe(MailKeyAction.Forward);
  expect(MailKeys.actionFor({ key: "f", ctrlKey: true, altKey: true })).toBe(MailKeyAction.ForwardAsAttachment);
  expect(MailKeys.actionFor({ key: "n", metaKey: true })).toBe(MailKeyAction.NewMail);
  expect(MailKeys.actionFor({ key: "M", ctrlKey: true, shiftKey: true })).toBe(MailKeyAction.NewMail);
});

test("Delete, archive, read state, flag", () => {
  expect(MailKeys.actionFor({ key: "Delete" })).toBe(MailKeyAction.Delete);
  expect(MailKeys.actionFor({ key: "d", ctrlKey: true })).toBe(MailKeyAction.Delete);
  expect(MailKeys.actionFor({ key: "Delete", shiftKey: true })).toBe(MailKeyAction.DeletePermanently);
  // Outlook: Backspace archives (frontend deletes)
  expect(MailKeys.actionFor({ key: "Backspace" })).toBe(MailKeyAction.Archive);
  expect(MailKeys.actionFor({ key: "q", ctrlKey: true })).toBe(MailKeyAction.MarkRead);
  expect(MailKeys.actionFor({ key: "u", ctrlKey: true })).toBe(MailKeyAction.MarkUnread);
  expect(MailKeys.actionFor({ key: "Insert" })).toBe(MailKeyAction.ToggleFlag);
  expect(MailKeys.actionFor({ key: "j", ctrlKey: true, altKey: true })).toBe(MailKeyAction.NotJunk);
});

test("Folders, sync, search, navigation", () => {
  expect(MailKeys.actionFor({ key: "V", ctrlKey: true, shiftKey: true })).toBe(MailKeyAction.MoveToFolder);
  expect(MailKeys.actionFor({ key: "Y", ctrlKey: true, shiftKey: true })).toBe(MailKeyAction.CopyToFolder);
  expect(MailKeys.actionFor({ key: "E", ctrlKey: true, shiftKey: true })).toBe(MailKeyAction.NewFolder);
  expect(MailKeys.actionFor({ key: "P", ctrlKey: true, shiftKey: true })).toBe(MailKeyAction.NewSearchFolder);
  expect(MailKeys.actionFor({ key: "I", ctrlKey: true, shiftKey: true })).toBe(MailKeyAction.GoToInbox);
  expect(MailKeys.actionFor({ key: "y", ctrlKey: true })).toBe(MailKeyAction.GoToFolder);
  expect(MailKeys.actionFor({ key: "B", ctrlKey: true, shiftKey: true })).toBe(MailKeyAction.AddressBook);
  expect(MailKeys.actionFor({ key: "F9" })).toBe(MailKeyAction.SendReceiveAll);
  expect(MailKeys.actionFor({ key: "m", ctrlKey: true })).toBe(MailKeyAction.SendReceiveAll);
  expect(MailKeys.actionFor({ key: "F9", shiftKey: true })).toBe(MailKeyAction.UpdateFolder);
  expect(MailKeys.actionFor({ key: "e", ctrlKey: true })).toBe(MailKeyAction.Search);
  expect(MailKeys.actionFor({ key: "F3" })).toBe(MailKeyAction.Search);
  expect(MailKeys.actionFor({ key: "k", ctrlKey: true, altKey: true })).toBe(MailKeyAction.ScopeCurrentFolder);
  expect(MailKeys.actionFor({ key: "a", ctrlKey: true, altKey: true })).toBe(MailKeyAction.ScopeAllAccounts);
  expect(MailKeys.actionFor({ key: "F", ctrlKey: true, shiftKey: true })).toBe(MailKeyAction.AdvancedFind);
  expect(MailKeys.actionFor({ key: ".", ctrlKey: true })).toBe(MailKeyAction.NextMessage);
  expect(MailKeys.actionFor({ key: ",", ctrlKey: true })).toBe(MailKeyAction.PreviousMessage);
  expect(MailKeys.actionFor({ key: "p", ctrlKey: true })).toBe(MailKeyAction.Print);
});

test("Thunderbird keys of the frontend are not bound", () => {
  expect(MailKeys.actionFor({ key: "m" })).toBeNull();
  expect(MailKeys.actionFor({ key: "s" })).toBeNull();
  expect(MailKeys.actionFor({ key: "j" })).toBeNull();
  expect(MailKeys.actionFor({ key: "f" })).toBeNull();
  expect(MailKeys.actionFor({ key: "b" })).toBeNull();
  expect(MailKeys.actionFor({ key: "l", ctrlKey: true })).toBeNull();
  expect(MailKeys.actionFor({ key: "L", ctrlKey: true, shiftKey: true })).toBeNull();
  expect(MailKeys.actionFor({ key: "N", ctrlKey: true, shiftKey: true })).toBeNull();
  expect(MailKeys.actionFor({ key: "F5" })).toBeNull();
  expect(MailKeys.actionFor({ key: "r", altKey: true })).toBeNull();
});

test("Which keys work in text fields", () => {
  expect(MailKeys.worksInTextFields(MailKeyAction.Search)).toBe(true);
  expect(MailKeys.worksInTextFields(MailKeyAction.NewMail)).toBe(true);
  expect(MailKeys.worksInTextFields(MailKeyAction.Delete)).toBe(false);
  expect(MailKeys.worksInTextFields(MailKeyAction.Archive)).toBe(false);
});
