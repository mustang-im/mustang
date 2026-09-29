import { appGlobal } from "../../../../logic/app";
import { MailAccount } from "../../../../logic/Mail/MailAccount";
import { SetupInfo } from "../../../../logic/Mail/AutoConfig/SetupInfo";
import type { PersonUID } from "../../../../logic/Abstract/PersonUID";
import { saveConfig, addDelegates } from "../../../../logic/Mail/AutoConfig/saveConfig";
import { UserError } from "../../../../logic/util/util";
import { expect, test } from "vitest";

/** A username instead of the email address, as seen in the error log (PARULA-146).
 * The account saved fine and then failed to load on the next start. */
test("Setup refuses a username as email address", async () => {
  let config = new MailAccount();
  let accountsBefore = appGlobal.emailAccounts.length;

  await expect(saveConfig(config, "somebody", "pw")).rejects.toThrow();

  expect(config.emailAddress).toBeFalsy();
  expect(appGlobal.emailAccounts.length).toBe(accountsBefore);
});

test("Setup refuses an empty email address", async () => {
  let config = new MailAccount();

  await expect(saveConfig(config, "", "pw")).rejects.toThrow();
});

function withDelegates(config: MailAccount, delegates: string[]): string[] {
  let tried: string[] = [];
  config.emailAddress = "fred.flintstone@example.com";
  config.setup = new SetupInfo();
  config.setup.delegatedAccounts = delegates;
  config.addDelegate = async (person: PersonUID) => {
    tried.push(person.emailAddress);
    if (person.emailAddress == "fails@example.com") {
      throw new UserError("No access");
    }
  };
  return tried;
}

test("Setup adds the delegated accounts, even when one fails, but not ourselves", async () => {
  let config = new MailAccount();
  config.canShareWithPersons = () => true;
  let tried = withDelegates(config,
    ["fails@example.com", "fred.flintstone@example.com", "barney.rubble@example.com"]);
  await addDelegates(config);
  expect(tried).toEqual(["fails@example.com", "barney.rubble@example.com"]);
});

test("Setup ignores delegated accounts where the protocol has no sharing", async () => {
  let config = new MailAccount();
  let tried = withDelegates(config, ["barney.rubble@example.com"]);
  await addDelegates(config);
  expect(tried).toEqual([]);
});
