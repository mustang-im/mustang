import { EditorShortcuts, type ShortcutKey } from "../../../Shared/Editor/EditorShortcuts";
import { EditorTool } from "../../../Shared/Editor/EditorTool";
import { expect, test } from "vitest";

function key(key: string, code: string, modifiers: Partial<ShortcutKey> = {}): ShortcutKey {
  return { key, code, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...modifiers };
}

test("Ctrl+K inserts a link", () => {
  expect(EditorShortcuts.toolFor(key("k", "KeyK", { ctrlKey: true }))).toBe(EditorTool.Link);
  expect(EditorShortcuts.toolFor(key("k", "KeyK", { metaKey: true }))).toBe(EditorTool.Link);
});

test("F4 finds, Ctrl+H replaces", () => {
  expect(EditorShortcuts.toolFor(key("F4", "F4"))).toBe(EditorTool.Find);
  expect(EditorShortcuts.toolFor(key("h", "KeyH", { ctrlKey: true }))).toBe(EditorTool.Replace);
});

test("Plain keys and other combinations do nothing", () => {
  expect(EditorShortcuts.toolFor(key("k", "KeyK"))).toBeNull();
  expect(EditorShortcuts.toolFor(key("h", "KeyH"))).toBeNull();
  expect(EditorShortcuts.toolFor(key("K", "KeyK", { ctrlKey: true, shiftKey: true }))).toBeNull();
  expect(EditorShortcuts.toolFor(key("h", "KeyH", { ctrlKey: true, altKey: true }))).toBeNull();
  expect(EditorShortcuts.toolFor(key("F4", "F4", { altKey: true }))).toBeNull();
  // Ctrl+F is the event form's Forward
  expect(EditorShortcuts.toolFor(key("f", "KeyF", { ctrlKey: true }))).toBeNull();
});
