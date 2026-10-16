// @vitest-environment happy-dom
import { ComposerKeyAction, ComposerKeyboard } from "../../../frontend/Mail/Composer/ComposerKeyboard";
import { expect, test } from "vitest";

function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent("keydown", { key, ...init });
}

test("Ctrl+Enter and Alt+S send", () => {
  expect(ComposerKeyboard.actionFor(press("Enter", { ctrlKey: true }), false)).toBe(ComposerKeyAction.Send);
  expect(ComposerKeyboard.actionFor(press("Enter", { metaKey: true }), true)).toBe(ComposerKeyAction.Send);
  expect(ComposerKeyboard.actionFor(press("s", { code: "KeyS", altKey: true }), false)).toBe(ComposerKeyAction.Send);
  expect(ComposerKeyboard.actionFor(press("Enter"), false)).toBeNull();
  expect(ComposerKeyboard.actionFor(press("Enter", { shiftKey: true }), false)).toBeNull();
});

test("Alt+S doesn't send on macOS, where Option+S types ß", () => {
  expect(ComposerKeyboard.actionFor(press("ß", { code: "KeyS", altKey: true }), true)).toBeNull();
});

test("Ctrl+S saves the draft", () => {
  expect(ComposerKeyboard.actionFor(press("s", { code: "KeyS", ctrlKey: true }), false)).toBe(ComposerKeyAction.SaveDraft);
  expect(ComposerKeyboard.actionFor(press("S", { code: "KeyS", ctrlKey: true, shiftKey: true }), false)).toBeNull();
  // Ctrl+Alt+S is AltGr+S on many layouts
  expect(ComposerKeyboard.actionFor(press("ś", { code: "KeyS", ctrlKey: true, altKey: true }), false)).toBeNull();
});
