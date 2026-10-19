// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { PersonUID } from "../../../../logic/Abstract/PersonUID";
import { RecipientText } from "../../../Mail/Composer/RecipientText";
import { expect, test } from "vitest";

// Like frontend's PersonAutocomplete without the name field: no email goes out with a bare address
test("Parses a plain email address and guesses the name", () => {
  let recipient = RecipientText.parse("  fred.miller@example.com ");
  expect(recipient.emailAddress).toBe("fred.miller@example.com");
  expect(recipient.name).toBe("Fred Miller");
});

test("Parses name and email address", () => {
  let recipient = RecipientText.parse("Fred Miller <fred@example.com>");
  expect(recipient.emailAddress).toBe("fred@example.com");
  expect(recipient.name).toBe("Fred Miller");

  let quoted = RecipientText.parse("\"Miller, Fred\"<fred@example.com>");
  expect(quoted.name).toBe("Miller, Fred");
});

test("Rejects text without a valid email address", () => {
  expect(RecipientText.parse("Fred")).toBeNull();
  expect(RecipientText.parse("Fred <fred>")).toBeNull();
  expect(RecipientText.parse("")).toBeNull();
});

test("Splits lists at ; , and line breaks, but not inside quotes or brackets", () => {
  expect(RecipientText.split("a@example.com; b@example.com, c@example.com\nd@example.com"))
    .toEqual(["a@example.com", "b@example.com", "c@example.com", "d@example.com"]);
  expect(RecipientText.split("\"Miller, Fred\" <fred@example.com>; anna@example.com"))
    .toEqual(["\"Miller, Fred\" <fred@example.com>", "anna@example.com"]);
  expect(RecipientText.split("Miller, Fred <fred@example.com>;;"))
    .toEqual(["Miller, Fred <fred@example.com>"]);
});

test("Parses a list and keeps the unresolved parts", () => {
  let { recipients, unresolved } = RecipientText.parseList("anna@example.com; bert; Carla <carla@example.com>");
  expect(recipients.map(recipient => recipient.emailAddress)).toEqual(["anna@example.com", "carla@example.com"]);
  expect(unresolved).toEqual(["bert"]);
});
