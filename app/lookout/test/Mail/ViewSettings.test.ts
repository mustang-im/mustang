// @vitest-environment happy-dom
import { ApplyScope, Column, MailViewSettings, ViewType } from "../../Mail/View/ViewSettings";
import { ArrangeBy } from "../../Mail/MessageList/MessageGrouping";
import { beforeEach, expect, test } from "vitest";

// Minimal stand-ins for `Folder`
function folder(id: string): any {
  return { id, account: { id: "acc" } };
}

beforeEach(() => {
  localStorage.clear();
});

test("Defaults: compact view by date, in groups", () => {
  let settings = MailViewSettings.of(folder("inbox"));
  expect(settings.type).toBe(ViewType.Compact);
  expect(settings.arrangeBy).toBe(ArrangeBy.Date);
  expect(settings.showInGroups).toBe(true);
  expect(settings.columns).toContain(Column.Subject);
});

test("A change for this folder doesn't affect other folders", () => {
  let inbox = folder("inbox");
  let sent = folder("sent");
  MailViewSettings.change(inbox, { type: ViewType.Single, arrangeBy: ArrangeBy.Size });
  expect(MailViewSettings.of(inbox).type).toBe(ViewType.Single);
  expect(MailViewSettings.of(inbox).arrangeBy).toBe(ArrangeBy.Size);
  expect(MailViewSettings.of(sent).type).toBe(ViewType.Compact);
});

test("A change for all folders overrides the folders' own value for that setting only", () => {
  let inbox = folder("inbox");
  let sent = folder("sent");
  MailViewSettings.change(inbox, { showAsConversations: false, type: ViewType.Preview });
  MailViewSettings.change(sent, { showAsConversations: false });
  MailViewSettings.change(inbox, { showAsConversations: true }, ApplyScope.AllFolders);
  expect(MailViewSettings.of(inbox).showAsConversations).toBe(true);
  expect(MailViewSettings.of(sent).showAsConversations).toBe(true);
  expect(MailViewSettings.of(folder("other-folder")).showAsConversations).toBe(true);
  expect(MailViewSettings.of(inbox).type).toBe(ViewType.Preview);
});

test("Reset View: the folder goes back to the original view", () => {
  let inbox = folder("inbox");
  MailViewSettings.change(inbox, { type: ViewType.Single });
  MailViewSettings.change(inbox, { previewLines: 3 }, ApplyScope.AllFolders);
  MailViewSettings.reset(inbox);
  expect(MailViewSettings.of(inbox).type).toBe(ViewType.Compact);
  expect(MailViewSettings.of(inbox).previewLines).toBe(1);
});

test("Apply the current view to other folders", () => {
  let inbox = folder("inbox");
  let work = folder("work");
  let family = folder("family");
  MailViewSettings.change(inbox, { type: ViewType.Single, columns: [Column.From, Column.Subject] });
  MailViewSettings.applyToFolders(inbox, [work]);
  expect(MailViewSettings.of(work).type).toBe(ViewType.Single);
  expect(MailViewSettings.of(work).columns).toEqual([Column.From, Column.Subject]);
  expect(MailViewSettings.of(family).type).toBe(ViewType.Compact);
});

test("Replace stores only the differences from the shared view", () => {
  let inbox = folder("inbox");
  let settings = { ...MailViewSettings.of(inbox), arrangeBy: ArrangeBy.From };
  MailViewSettings.replace(inbox, settings);
  expect(MailViewSettings.folders.value["acc/inbox"]).toEqual({ arrangeBy: ArrangeBy.From });
});
