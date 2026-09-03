// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { ActiveSyncAccount } from "../../../../logic/Mail/ActiveSync/ActiveSyncAccount";
import { AuthMethod } from "../../../../logic/Abstract/Account";
import { gLicense } from "../../../../logic/util/License";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

/** The HTTP calls that the account made */
let calls: { method: string, url: string }[] = [];

beforeEach(() => {
  gLicense.license = { valid: true } as any;
  calls = [];
  vi.stubGlobal("fetch", async (url: string, options: any) => {
    calls.push({ method: options.method, url: String(url) });
    return {
      ok: true,
      headers: new Headers({ "MS-ASProtocolVersions": "2.0,2.5,12.0,12.1,14.0,14.1,16.0,16.1" }),
    } as any;
  });
});
afterEach(() => vi.unstubAllGlobals());

test("The login asks the server which protocol version it speaks", async () => {
  let account = setupAccount();

  await account.login(false);

  expect(account.protocolVersion).toBe("16.1");
  expect(calls).toEqual([{ method: "OPTIONS", url: account.url }]);
});

test("The login uses the protocol version that we already know", async () => {
  let account = setupAccount();
  account.setStorageItem("protocolVersion", "14.1");

  await account.login(false);

  expect(account.protocolVersion).toBe("14.1");
  expect(calls).toEqual([]);
});

function setupAccount(): ActiveSyncAccount {
  let account = new ActiveSyncAccount();
  account.url = "https://exchange.example.com/Microsoft-Server-ActiveSync";
  account.emailAddress = "test@example.com";
  account.username = "test@example.com";
  account.password = "test";
  account.authMethod = AuthMethod.Password;
  return account;
}
