import { removeQuotes, removeSignature, removeDisclaimer } from "../../../logic/Mail/cleanPlaintext";
import { expect, test } from "vitest";

test("Remove quote below the reply", () => {
  let text = "Yes, Friday works.\n\nOn Mon, 3 Mar 2025, Fred <fred@example.com> wrote:\n> Can we meet on Friday?\n>\n> Fred";
  expect(removeQuotes(text)).toBe("Yes, Friday works.");
});

test("Remove interleaved quotes", () => {
  let text = "Fred schrieb am 03.03.2025:\n> Friday?\nYes.\n> 10:00?\nBetter 11:00.";
  expect(removeQuotes(text)).toBe("Yes.\nBetter 11:00.");
});

test("Remove Outlook original message", () => {
  let text = "Thanks!\n\n-----Original Message-----\nFrom: Fred\nSent: Monday\n\nCan we meet?";
  expect(removeQuotes(text)).toBe("Thanks!");
  let text2 = "Danke!\n\n________________________________\nVon: Fred\nGesendet: Montag\n\nTreffen?";
  expect(removeQuotes(text2)).toBe("Danke!");
});

test("Keep text without quotes", () => {
  let text = "Hello Fred,\n\nsee you on Friday: 11:00.";
  expect(removeQuotes(text)).toBe(text);
});

test("Remove signature", () => {
  expect(removeSignature("See you.\n\n-- \nFred Example\nACME Inc.")).toBe("See you.");
  expect(removeSignature("A -- B")).toBe("A -- B");
});

test("Remove disclaimer at the end", () => {
  let text = "The contract is attached.\n\nACME GmbH, Amtsgericht München HRB 12345, Geschäftsführer: Fred\n\nThis email is confidential. If you are not the intended recipient, delete it.";
  expect(removeDisclaimer(text)).toBe("The contract is attached.");
  let onlyText = "Please keep this confidential.";
  expect(removeDisclaimer(onlyText)).toBe(onlyText);
});
