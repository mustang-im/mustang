import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import type { TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import { expect, test } from "vitest";

appGlobal.remoteApp ??= { kyCreate: () => null } as any;

/** The listener waits between reconnects, so the tests that let it reconnect take a while */
const kTimeoutSec = 60;

function newAccount(): JMAPAccount {
  let account = new JMAPAccount();
  account.accountID = "u1";
  account.session = {
    capabilities: {},
    accounts: { u1: { accountCapabilities: {} } },
    eventSourceUrl: "https://example.com/jmap/eventsource/?types={types}&closeafter={closeafter}&ping={ping}",
  } as any as TJMAPSession;
  return account;
}

/** A connection that the server accepts and then closes, which ends one round of the loop */
function closedConnection(): any {
  return {
    ok: true,
    body: new ReadableStream({ start: controller => controller.close() }),
  };
}

function rejectedConnection(status: number, statusText: string, retryAfterSec?: number): any {
  return {
    ok: false,
    status: status,
    statusText: statusText,
    headers: new Headers(retryAfterSec ? { "Retry-After": String(retryAfterSec) } : {}),
  };
}

/** Answers the event source connections with `responses`, in order, then logs the account out */
function serve(account: JMAPAccount, responses: any[]): () => number {
  let attempts = 0;
  globalThis.fetch = (async () => {
    let response = responses[attempts++];
    if (attempts >= responses.length) {
      account.session = null; // `isLoggedIn` false, so the loop ends after this connection
    }
    return response;
  }) as any;
  return () => attempts;
}

test("A rate-limited push connection is opened again", { timeout: kTimeoutSec * 1000 }, async () => {
  let account = newAccount();
  let attempts = serve(account, [rejectedConnection(429, "Too Many Requests", 1), closedConnection()]);

  await account.startPushListener();

  expect(attempts()).toBe(2);
});

test("A push connection that the server refuses outright is reported", async () => {
  let account = newAccount();
  let attempts = serve(account, [rejectedConnection(403, "Forbidden"), closedConnection()]);

  await expect(account.startPushListener()).rejects.toThrow("403");

  expect(attempts()).toBe(1);
});
