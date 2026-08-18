import "../../../../logic/app"; // Avoid import cycle
import { getEmailAddressOrX400 } from "../../../../logic/Mail/EWS/EWSEMail";
import { expect, test } from "vitest";

test("Mailbox without EmailAddress", () => {
  expect(getEmailAddressOrX400(undefined)).toBe(null);
  expect(getEmailAddressOrX400(null)).toBe(null);
  expect(getEmailAddressOrX400("")).toBe(null);
  expect(getEmailAddressOrX400({} as any)).toBe(null);
});

test("Email address", () => {
  expect(getEmailAddressOrX400("Ben@Example.COM")).toBe("ben@example.com");
});
