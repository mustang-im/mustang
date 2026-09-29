import { appGlobal } from "../../../../logic/app";
import { MailAccount } from "../../../../logic/Mail/MailAccount";
import { SetupInfo } from "../../../../logic/Mail/AutoConfig/SetupInfo";
import { PersonUID } from "../../../../logic/Abstract/PersonUID";
import { saveConfig, addDelegates } from "../../../../logic/Mail/AutoConfig/saveConfig";
import { NotImplemented, UserError } from "../../../../logic/util/util";
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

test("Setup adds the delegated accounts, even when one fails", async () => {
  let config = new MailAccount();
  config.setup = new SetupInfo();
  config.setup.delegatedAccounts = ["fails@example.com", "barney.rubble@example.com"];
  let tried: string[] = [];
  config.addDelegate = async (person: PersonUID) => {
    tried.push(person.emailAddress);
    if (person.emailAddress == "fails@example.com") {
      throw new UserError("No access");
    }
  };
  await addDelegates(config);
  expect(tried).toEqual(["fails@example.com", "barney.rubble@example.com"]);
});

test("A protocol without delegated accounts says so", async () => {
  let config = new MailAccount();
  await expect(config.addDelegate(new PersonUID("barney.rubble@example.com"))).rejects.toThrow(NotImplemented);
});
