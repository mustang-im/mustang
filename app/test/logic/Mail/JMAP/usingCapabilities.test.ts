import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import type { TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import { expect, test } from "vitest";

/** @returns the `using` of the request that `makeCalls()` sends to a server with these capabilities */
async function usingFor(capabilities: string[]): Promise<string[]> {
  appGlobal.remoteApp = { kyCreate: () => null } as any;
  let account = new JMAPAccount();
  account.accountID = "u1";
  account.session = {
    capabilities: Object.fromEntries(capabilities.map(capability => [capability, {}])),
    accounts: { u1: { accountCapabilities: Object.fromEntries(capabilities.map(capability => [capability, {}])) } },
    apiUrl: "https://example.com/jmap/",
    state: "s1",
  } as any as TJMAPSession;
  let using: string[];
  account.httpPost = async (url: string, request: any) => {
    using = request.using;
    return { methodResponses: [["Core/echo", {}, "c1"]], sessionState: "s1" };
  };
  await account.makeSingleCall("Core/echo", {});
  return using;
}

test("A server without email submission doesn't get it in `using`", async () => {
  let using = await usingFor(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"]);

  expect(using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"]);
});

test("A server with contacts and calendars, but without email", async () => {
  let using = await usingFor(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:contacts", "urn:ietf:params:jmap:calendars"]);

  expect(using).toEqual(["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:contacts", "urn:ietf:params:jmap:calendars"]);
});

test("All capabilities that we use, from Stalwart's session", async () => {
  let using = await usingFor([
    "urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail", "urn:ietf:params:jmap:calendars", "urn:ietf:params:jmap:contacts",
    "urn:ietf:params:jmap:principals", "urn:ietf:params:jmap:submission", "urn:ietf:params:jmap:vacationresponse",
    "urn:ietf:params:jmap:blob", "urn:ietf:params:jmap:quota", "urn:ietf:params:jmap:websocket",
  ]);

  expect(using).toEqual([
    "urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail", "urn:ietf:params:jmap:submission",
    "urn:ietf:params:jmap:contacts", "urn:ietf:params:jmap:calendars", "urn:ietf:params:jmap:principals",
  ]);
});
