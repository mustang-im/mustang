// @vitest-environment happy-dom
import { expect, test } from 'vitest'
import { License, NoValidLicense } from '../../../logic/util/LicenseClient';
import { gLicense } from '../../../logic/util/License';
import { k1DayMS } from '../../../frontend/Util/date';

function clientExpiringInDays(days: number): License {
  let client = new License();
  client.expiresOn = new Date(Date.now() + days * k1DayMS);
  return client;
}

test("Never had a license", () => {
  let client = new License();
  expect(client.valid).toBe(false);
  expect(client.isExpired).toBe(false);
  expect(client.isSoonExpiring).toBe(false);
});

test("Valid license", () => {
  let client = clientExpiringInDays(200.5);
  expect(client.valid).toBe(true);
  expect(client.isExpired).toBe(false);
  expect(client.isSoonExpiring).toBe(false);
  expect(client.daysLeft).toBe(200);
});

test("Soon expiring license", () => {
  let client = clientExpiringInDays(1);
  expect(client.valid).toBe(true);
  expect(client.isSoonExpiring).toBe(true);
});

test("Recently expired license", () => {
  let client = clientExpiringInDays(-1);
  expect(client.valid).toBe(false);
  expect(client.isExpired).toBe(true);
  expect(client.hasRecentlyExpired).toBe(true);
});

test("Long expired license needs no server call", async () => {
  let client = clientExpiringInDays(-400);
  expect(client.hasRecentlyExpired).toBe(false);
  let previous = gLicense.license;
  gLicense.license = client;
  try {
    await expect(client.ensureLicensed()).rejects.toThrow(NoValidLicense);
  } finally {
    gLicense.license = previous;
  }
});

test("Refresh date passed", () => {
  let client = clientExpiringInDays(200);
  expect(client.requiresRefresh).toBe(false);
  client.refreshOn = new Date(Date.now() - k1DayMS);
  expect(client.requiresRefresh).toBe(true);
});

test("License change notifies the UI", () => {
  let client = new License();
  let validSeen: boolean[] = [];
  client.subscribe(() => validSeen.push(client.valid));
  client.expiresOn = new Date(Date.now() + 200 * k1DayMS);
  expect(validSeen).toEqual([false, true]);
});

test("Ticket with bad signature is rejected", async () => {
  let client = new License();
  let ticket = {
    json: JSON.stringify({ end: "2099-01-01", refresh: "2099-01-01" }),
    signature: "00".repeat(128),
  };
  await expect(client.addTicket(JSON.stringify(ticket))).rejects.toThrow();
  expect(client.valid).toBe(false);
  expect(client.savedTicket()).toBeNull();
});
