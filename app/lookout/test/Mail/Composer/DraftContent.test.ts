// @vitest-environment happy-dom
import { DraftContent } from "../../../Mail/Composer/DraftContent";
import { expect, test } from "vitest";

const kLongText = "This is a longer message that the user wrote, with enough words to count as real content of the email. It has two sentences.";

test("Empty and short mails have no user text", () => {
  expect(DraftContent.hasUserText("")).toBe(false);
  expect(DraftContent.hasUserText("<p></p>")).toBe(false);
  expect(DraftContent.hasUserText("<p>Thanks!</p>")).toBe(false);
});

test("Longer text counts as user text", () => {
  expect(DraftContent.hasUserText(`<p>${kLongText}</p>`)).toBe(true);
});

test("Quoted text does not count", () => {
  let reply = `<p class="quote-header">Anna wrote on 1/2/2026:</p><blockquote><p>${kLongText}</p></blockquote>`;
  expect(DraftContent.hasUserText(reply)).toBe(false);
  expect(DraftContent.hasUserText(`<p>${kLongText}</p>${reply}`)).toBe(true);
});

test("Whitespace does not count", () => {
  let spaced = "<p>" + "a ".repeat(60) + "</p>";
  expect(DraftContent.hasUserText(spaced)).toBe(false);
});
