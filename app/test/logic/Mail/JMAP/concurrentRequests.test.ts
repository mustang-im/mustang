import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import type { TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import { expect, test } from "vitest";

/** Stalwart's default. It answers one request too many with HTTP 400 `maxConcurrentRequests`,
 * and counts API calls, downloads and uploads together, per user. */
const kServerMax = 4;
const kAPIURL = "https://example.com/jmap/";
const kDownloadURL = "https://example.com/jmap/download/u1/b1/email";
const kUploadURL = "https://example.com/jmap/upload/u1/";

/** A server whose requests take a moment, and which counts how many run at once */
function stubServer(counter: { running: number, max: number }) {
  let handle = async () => {
    counter.max = Math.max(counter.max, ++counter.running);
    await new Promise(resolve => setTimeout(resolve, 2));
    counter.running--;
    return {};
  };
  appGlobal.remoteApp = {
    kyCreate: () => ({ get: handle, post: handle }),
  } as any;
}

function newAccount(): JMAPAccount {
  let account = new JMAPAccount();
  account.accountID = "u1";
  account.session = {
    capabilities: {
      "urn:ietf:params:jmap:core": { maxConcurrentRequests: kServerMax },
    },
  } as any as TJMAPSession;
  return account;
}

/** API calls, downloads and uploads of `account`, all at once */
function manyRequests(account: JMAPAccount, count: number): Promise<any>[] {
  let requests: Promise<any>[] = [];
  for (let i = 0; i < count; i++) {
    requests.push(account.httpPost(kAPIURL, { methodCalls: [] }));
    requests.push(account.httpGet(kDownloadURL));
    requests.push(account.httpPostBinary(kUploadURL, new Uint8Array(1)));
  }
  return requests;
}

test("API calls, downloads and uploads together stay within the server's maxConcurrentRequests", async () => {
  let counter = { running: 0, max: 0 };
  stubServer(counter);
  let account = newAccount();

  let results = await Promise.all(manyRequests(account, 5));

  expect(results.length).toBe(15);
  expect(counter.max).toBe(kServerMax);
});

test("Requests for an account shared with us count towards the same limit", async () => {
  let counter = { running: 0, max: 0 };
  stubServer(counter);
  let account = newAccount();
  let sharedAccount = new JMAPAccount();
  sharedAccount.mainAccount = account;
  sharedAccount.accountID = "u2";
  sharedAccount.session = account.session;

  await Promise.all([
    ...manyRequests(account, 3),
    ...manyRequests(sharedAccount, 3),
  ]);

  expect(counter.max).toBe(kServerMax);
});

test("A failed request frees its slot", async () => {
  let started = 0;
  appGlobal.remoteApp = {
    kyCreate: () => ({ post: async () => {
      started++;
      throw Object.assign(new Error("HTTP POST failed with 500"), { name: "HTTPError", httpCode: 500 });
    } }),
  } as any;
  let account = newAccount();

  for (let i = 0; i < kServerMax + 2; i++) {
    await expect(account.httpPost(kAPIURL, {})).rejects.toThrow();
  }

  expect(started).toBe(kServerMax + 2);
});
