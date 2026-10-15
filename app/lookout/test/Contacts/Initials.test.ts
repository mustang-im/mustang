import { Initials } from "../../Contacts/Initials";
import { expect, test } from "vitest";

test("Initials of first and last name", () => {
  expect(Initials.of("Anna Schmidt")).toBe("AS");
  expect(Initials.of("Anna Maria Schmidt")).toBe("AS");
  expect(Initials.of("  anna   schmidt  ")).toBe("AS");
});

test("Initials of a single word", () => {
  expect(Initials.of("Board")).toBe("B");
  expect(Initials.of("fred@example.com")).toBe("F");
});

test("Initials with accents, digits and other scripts", () => {
  expect(Initials.of("Émile Zola")).toBe("ÉZ");
  expect(Initials.of("1&1 Support")).toBe("1S");
  expect(Initials.of("Юлия Иванова")).toBe("ЮИ");
});

test("Initials skip words that start with punctuation", () => {
  expect(Initials.of("Anna (work)")).toBe("A");
  expect(Initials.of("- Bert -")).toBe("B");
});

test("No initials", () => {
  expect(Initials.of("")).toBe("");
  expect(Initials.of("  ")).toBe("");
  expect(Initials.of("&&&")).toBe("");
  expect(Initials.of(null)).toBe("");
  expect(Initials.of(undefined)).toBe("");
});
