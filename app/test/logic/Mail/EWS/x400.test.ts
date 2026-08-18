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

test("X.400 address", () => {
  expect(getEmailAddressOrX400("/o=ExchangeLabs/ou=Exchange Administrative Group (FYDIBOHF23SPDLT)/cn=Recipients/cn=ben")).toBe("ben@fydibohf23spdlt.exchangelabs.xfourhundred");
  expect(getEmailAddressOrX400("/O=ExchangeLabs/OU=First Administrative Group/cn=Recipients/cn=abc123-ben")).toBe("abc123-ben@firstadministrativegroup.exchangelabs.xfourhundred");
  expect(getEmailAddressOrX400("/o=Contoso/ou=Exchange Administrative Group (FYDIBOHF23SPDLT)/cn=Recipients")).toBe("user@fydibohf23spdlt.contoso.xfourhundred");
});
