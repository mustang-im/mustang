import { SMLHTTPAccount } from '../../../../logic/Mail/SML/SMLHTTPAccount';
import { MailIdentity } from '../../../../logic/Mail/MailIdentity';
import { setupTestMailAccount } from '../setup';
import { kMailAccounts } from '../logins';
import { connectToBackend, stopBackend } from '../../util/backend.test';
import { afterAll, beforeAll, expect, test } from 'vitest';

/** Attention: Slow. Typically takes 15 seconds, or more */
async function accountSetup() {
  await connectToBackend();
  let config = kMailAccounts[0];
  if (!config) {
    throw new Error("Please define test accounts in test/logic/Mail/logins.ts");
  }
  let mailAccount = await setupTestMailAccount(config);
  await registerSMLHTTP(mailAccount.identities.first);
}

beforeAll(accountSetup, 30000);
afterAll(stopBackend);

let acc: SMLHTTPAccount;

/**
 * Registers an SML HTTP account, if not yet done.
 *
 * @warning Waits for email, so often takes minutes or hangs entirely. Do not `await` it.
 */
async function registerSMLHTTP(identity: MailIdentity) {
  acc = SMLHTTPAccount.getOrCreateAccount(identity.emailAddress, identity.realname);
  if (!acc.isLoggedIn) {
    acc.mailAccount = identity.account;
    await acc.login(); // waits for email, so often takes minutes or hangs entirely
  }
}

test("SML HTTP resource REST API", async () => {
  let bundle = crypto.randomUUID();
  let mainRes = crypto.randomUUID();
  let mainContent = { "question": "abs" };
  let { resourceURL: mainURL } = await acc.saveResource(bundle, mainRes, false, mainContent);
  let userRes = crypto.randomUUID();
  let userContent = { "answer": 1 };
  let { resourceURL: userURL } = await acc.saveResource(bundle, userRes, true, userContent);

  let response = await fetch(mainURL);
  let mainContentResponse = await response.json();
  expect(mainContentResponse.question).toBe(mainContent.question);
  response = await fetch(userURL);
  let userContentResponse = await response.json();
  expect(userContentResponse.answer).toBe(userContent.answer);

  let userContentChanged = { "answer": 2 };
  console.log("User URL", userURL);
  response = await fetch(userURL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userContentChanged),
  });
  let userContentChangedResponse = await response.json();
  expect(userContentChangedResponse.answer).toBe(userContentChanged.answer);

  let mainContentChanged = { "question": "2" };
  response = await fetch(mainURL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mainContentChanged),
  });
  let mainContentChangedResponse = mainContent;
  await expect(async () => {
    mainContentChangedResponse = await response.json();
  }).rejects.toThrowError();
  expect(mainContentChangedResponse.question).not.toBe(mainContentChanged.question);
  let { resourceURL: mainURLChanged } = await acc.saveResource(bundle, mainRes, false, mainContentChanged);
  response = await fetch(userURL);
  mainContentChangedResponse = await response.json();
  expect(mainContentChangedResponse.question).toBe(mainContentChanged.question);
  expect(mainURL).toBe(mainURLChanged);
});
