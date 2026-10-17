// @vitest-environment happy-dom
import { EditorFind } from "../../../Shared/Editor/EditorFind";
import { TextStatistics } from "../../../Shared/Editor/TextStatistics";
import { DateTimeFormats } from "../../../Shared/Editor/DateTimeFormats";
import { SymbolTable } from "../../../Shared/Editor/SymbolTable";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, expect, test } from "vitest";

let editor: Editor;

function newEditor(html: string): Editor {
  editor = new Editor({ element: document.createElement("div"), extensions: [StarterKit], content: html });
  return editor;
}

afterEach(() => {
  editor?.destroy();
});

test("Finds all matches, ignoring case unless asked", () => {
  newEditor("<p>Hello <strong>World</strong>, hello again</p><p>HELLO</p>");
  let matches = EditorFind.matches(editor.state.doc, "hello");
  expect(matches.length).toBe(3);
  expect(matches.map(match => editor.state.doc.textBetween(match.from, match.to))).toEqual(["Hello", "hello", "HELLO"]);
  expect(EditorFind.matches(editor.state.doc, "hello", true).length).toBe(1);
  expect(EditorFind.matches(editor.state.doc, "").length).toBe(0);
});

test("Matches across marks and after line breaks", () => {
  newEditor("<p>a<br>Wor<em>ld</em> peace</p>");
  let [match] = EditorFind.matches(editor.state.doc, "world");
  expect(editor.state.doc.textBetween(match.from, match.to)).toBe("World");
});

test("Find Next selects the next match and wraps around", () => {
  newEditor("<p>one two one two</p>");
  expect(EditorFind.findNext(editor, "two")).toBe(true);
  let first = editor.state.selection.from;
  expect(EditorFind.findNext(editor, "two")).toBe(true);
  expect(editor.state.selection.from).toBeGreaterThan(first);
  expect(EditorFind.findNext(editor, "two")).toBe(true);
  expect(editor.state.selection.from).toBe(first);
  expect(EditorFind.findNext(editor, "three")).toBe(false);
});

test("Replace replaces the selected match and finds the next", () => {
  newEditor("<p>cat dog cat</p>");
  EditorFind.findNext(editor, "cat");
  EditorFind.replace(editor, "cat", "bird");
  expect(editor.getText()).toBe("bird dog cat");
  expect(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)).toBe("cat");
});

test("Replace All replaces every match, also with nothing", () => {
  newEditor("<p>a-b-c</p><p>d-e</p>");
  expect(EditorFind.replaceAll(editor, "-", " + ")).toBe(3);
  expect(editor.getText({ blockSeparator: "|" })).toBe("a + b + c|d + e");
  expect(EditorFind.replaceAll(editor, " + ", "")).toBe(3);
  expect(editor.getText({ blockSeparator: "|" })).toBe("abc|de");
});

test("Counts words, characters and paragraphs", () => {
  let statistics = new TextStatistics(["Hello  world, how are you?", "", "Fine"]);
  expect(statistics.words).toBe(6);
  expect(statistics.paragraphs).toBe(2);
  expect(statistics.charactersWithSpaces).toBe(26 + 4);
  expect(statistics.charactersWithoutSpaces).toBe(21 + 4);
});

test("Counts the editor text, or only the selection", () => {
  newEditor("<p>One two three</p><p>Four</p>");
  expect(TextStatistics.ofEditor(editor).words).toBe(4);
  editor.commands.setTextSelection({ from: 1, to: 8 });
  expect(TextStatistics.ofEditor(editor).words).toBe(2);
});

test("Date formats are distinct and include the ISO date", () => {
  let date = new Date(2026, 9, 5, 14, 7, 9);
  let formats = DateTimeFormats.list(date, "en-US");
  expect(formats).toContain("2026-10-05");
  expect(formats).toContain("10/5/26");
  expect(formats).toContain("Monday, October 5, 2026");
  expect(formats).toContain("14:07");
  expect(new Set(formats).size).toBe(formats.length);
});

test("Symbol subsets skip unassigned and invisible characters", () => {
  let latin1 = SymbolTable.subsets[0];
  let characters = SymbolTable.characters(latin1);
  expect(characters).toContain("©");
  expect(characters).not.toContain("­");
  expect(SymbolTable.characterCode("©")).toBe("00A9");
  expect(SymbolTable.subsetOf("→").name).toBe("Arrows");
});

test("Recently used symbols come first in the gallery", () => {
  SymbolTable.recentSymbols.value = [];
  expect(SymbolTable.gallery()[0]).toBe("€");
  SymbolTable.used("→");
  SymbolTable.used("©");
  let gallery = SymbolTable.gallery();
  expect(gallery.slice(0, 2)).toEqual(["©", "→"]);
  expect(gallery.length).toBe(20);
  expect(new Set(gallery).size).toBe(20);
});
