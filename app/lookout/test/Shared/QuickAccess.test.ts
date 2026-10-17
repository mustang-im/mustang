import { QuickAccessToolbar, type QuickAccessCommand } from "../../Shared/QuickAccess/QuickAccess";
import { expect, test } from "vitest";

function command(id: string, shownByDefault = false): QuickAccessCommand {
  return { id, label: id, icon: null, run: () => {}, shownByDefault };
}

const commands = [command("sendReceiveAll", true), command("reply"), command("delete")];

test("Without a choice, the default commands are shown", () => {
  expect(QuickAccessToolbar.shown(commands, null).map(shown => shown.id)).toEqual(["sendReceiveAll"]);
});

test("Chosen commands are shown in the order the user added them, unknown IDs are skipped", () => {
  let shown = QuickAccessToolbar.shown(commands, ["delete", "otherApp.command", "sendReceiveAll"]);
  expect(shown.map(command => command.id)).toEqual(["delete", "sendReceiveAll"]);
});

test("Toggling adds at the end and removes, starting from the defaults", () => {
  let ids = QuickAccessToolbar.toggled(commands[1], commands, null);
  expect(ids).toEqual(["sendReceiveAll", "reply"]);
  ids = QuickAccessToolbar.toggled(commands[0], commands, ids);
  expect(ids).toEqual(["reply"]);
  ids = QuickAccessToolbar.toggled(commands[0], commands, ids);
  expect(ids).toEqual(["reply", "sendReceiveAll"]);
});

test("Toggling keeps the commands of other apps", () => {
  let ids = QuickAccessToolbar.toggled(commands[2], commands, ["calendar.today", "reply"]);
  expect(ids).toEqual(["calendar.today", "reply", "delete"]);
});
