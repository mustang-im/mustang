// @vitest-environment happy-dom
import "../../../../logic/app"; // first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { MailAccount } from "../../../../logic/Mail/MailAccount";
import { Addressbook } from "../../../../logic/Contacts/Addressbook";
import { ImportExportFlow } from "../../../Settings/ImportExport/ImportExportFlow";
import { ArrayColl } from "svelte-collections";
import { beforeEach, expect, test, vi } from "vitest";

// A Thunderbird profile with 2 accounts and 1 address book, and a test profile that is skipped
const thunderbird = vi.hoisted(() => ({
  accounts: [] as MailAccount[],
  addressbooks: [] as Addressbook[],
  addressbookError: null as Error | null,
  readProfiles: [] as string[],
}));
vi.mock("../../../../logic/Mail/Import/Thunderbird/TBProfile", () => ({
  ThunderbirdProfile: {
    findProfiles: async () => ["default", "Test profile"].map(name => ({
      name,
      readMailAccounts: async () => {
        thunderbird.readProfiles.push(name);
        return thunderbird.accounts;
      },
    })),
  },
}));
vi.mock("../../../../logic/Mail/Import/Thunderbird/TBAddressbook", () => ({
  ThunderbirdAddressbook: {
    readAll: async (profile: any, abErrorCallback: (ex: Error) => void) => {
      if (thunderbird.addressbookError) {
        abErrorCallback(thunderbird.addressbookError);
      }
      return new ArrayColl(thunderbird.addressbooks);
    },
  },
}));

function newAccount(emailAddress: string): MailAccount {
  let account = new MailAccount();
  account.name = emailAddress;
  account.emailAddress = emailAddress;
  return account;
}

beforeEach(() => {
  let personal = new Addressbook();
  personal.name = "Personal Address Book";
  personal.save = vi.fn(async () => {});
  thunderbird.accounts = [newAccount("anna@example.org"), newAccount("fred@example.com")];
  thunderbird.addressbooks = [personal];
  thunderbird.addressbookError = null;
  thunderbird.readProfiles = [];
  appGlobal.emailAccounts.replaceAll([newAccount("fred@example.com")]);
  appGlobal.addressbooks.clear();
});

test("Import from another program goes from the program to the items, and finds Thunderbird's accounts and address books", async () => {
  let flow = new ImportExportFlow();
  flow.action = "import-program";
  flow.next();
  expect(flow.step).toBe("program");
  expect(flow.program).toBe("thunderbird");
  flow.next();
  expect(flow.step).toBe("items");
  expect(flow.isLastStep).toBe(true);
  expect(flow.canGoNext).toBe(false);
  await flow.programImport.search();
  expect(thunderbird.readProfiles).toEqual(["default"]);
  expect(flow.programImport.accounts.map(choice => [choice.item.emailAddress, choice.selected, choice.isAdded])).toEqual([
    ["anna@example.org", true, false],
    ["fred@example.com", false, true],
  ]);
  expect(flow.programImport.addressbooks.map(choice => choice.item.name)).toEqual(["Personal Address Book"]);
  expect(flow.canGoNext).toBe(true);
});

test("Finish imports the chosen address books and hands the chosen accounts to Add Account", async () => {
  let flow = new ImportExportFlow(null, "import-program");
  expect(flow.step).toBe("program");
  flow.next();
  await flow.programImport.search();
  await flow.finish();
  expect(appGlobal.addressbooks.contents.map(addressbook => addressbook.name)).toEqual(["Personal Address Book"]);
  expect(flow.accountsToAdd.map(account => account.emailAddress)).toEqual(["anna@example.org"]);
});

test("Nothing chosen, nothing to finish", async () => {
  let flow = new ImportExportFlow(null, "import-program");
  flow.next();
  await flow.programImport.search();
  for (let choice of [...flow.programImport.accounts, ...flow.programImport.addressbooks]) {
    choice.selected = false;
  }
  expect(flow.canGoNext).toBe(false);
  expect(flow.accountsToAdd).toEqual([]);
});

test("A running Thunderbird locks its address books, which the wizard says", async () => {
  let locked = new Error("database is locked");
  (locked as any).code = "SQLITE_BUSY";
  thunderbird.addressbookError = locked;
  thunderbird.addressbooks = [];
  let flow = new ImportExportFlow(null, "import-program");
  flow.next();
  await flow.programImport.search();
  expect(flow.programImport.isThunderbirdRunning).toBe(true);
  expect(flow.programImport.accounts).toHaveLength(2);
});

test("Without Thunderbird profiles, the wizard says that Thunderbird is not installed", async () => {
  let { ThunderbirdProfile } = await import("../../../../logic/Mail/Import/Thunderbird/TBProfile");
  let findProfiles = vi.spyOn(ThunderbirdProfile, "findProfiles").mockResolvedValue([]);
  let flow = new ImportExportFlow(null, "import-program");
  flow.next();
  await flow.programImport.search();
  expect(flow.programImport.isInstalled).toBe(false);
  expect(flow.canGoNext).toBe(false);
  findProfiles.mockRestore();
});
