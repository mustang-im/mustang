import { ComposerShortcuts, ComposerCommand, type ComposerKey } from "../../../Mail/Composer/ComposerShortcuts";
import { expect, test } from "vitest";

function key(key: string, code: string, modifiers: Partial<ComposerKey> = {}): ComposerKey {
  return { key, code, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...modifiers };
}

test("Ctrl+Enter and Alt+S send", () => {
  expect(ComposerShortcuts.commandFor(key("Enter", "Enter", { ctrlKey: true }))).toBe(ComposerCommand.Send);
  expect(ComposerShortcuts.commandFor(key("Enter", "Enter", { metaKey: true }))).toBe(ComposerCommand.Send);
  expect(ComposerShortcuts.commandFor(key("s", "KeyS", { altKey: true }))).toBe(ComposerCommand.Send);
  // Alt+S on a Mac keyboard gives "ß"
  expect(ComposerShortcuts.commandFor(key("ß", "KeyS", { altKey: true }))).toBe(ComposerCommand.Send);
});

test("Ctrl+S saves", () => {
  expect(ComposerShortcuts.commandFor(key("s", "KeyS", { ctrlKey: true }))).toBe(ComposerCommand.Save);
  // Editor tools are EditorShortcuts
  expect(ComposerShortcuts.commandFor(key("k", "KeyK", { ctrlKey: true }))).toBeNull();
});

test("Plain keys and other combinations do nothing", () => {
  expect(ComposerShortcuts.commandFor(key("Enter", "Enter"))).toBeNull();
  expect(ComposerShortcuts.commandFor(key("s", "KeyS"))).toBeNull();
  expect(ComposerShortcuts.commandFor(key("Enter", "Enter", { ctrlKey: true, shiftKey: true }))).toBeNull();
  expect(ComposerShortcuts.commandFor(key("S", "KeyS", { ctrlKey: true, shiftKey: true }))).toBeNull();
  expect(ComposerShortcuts.commandFor(key("s", "KeyS", { ctrlKey: true, altKey: true }))).toBeNull();
  expect(ComposerShortcuts.commandFor(key("Enter", "Enter", { altKey: true }))).toBeNull();
});
