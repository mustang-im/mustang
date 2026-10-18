// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import { JMAPAddressbook } from "../../../../logic/Contacts/JMAP/JMAPAddressbook";
import type { TJMAPAddressbook } from "../../../../logic/Contacts/JMAP/TJMAPAddressbook";
import { SQLAddressbookStorage } from "../../../../logic/Contacts/SQL/SQLAddressbookStorage";
import { afterEach, beforeAll, expect, test } from "vitest";

beforeAll(() => {
  appGlobal.remoteApp ??= {
    kyCreate: () => { throw new Error("The test should not talk to a real server"); },
  } as any;
  JMAPAddressbook.prototype.save = async () => {}; // no database
  SQLAddressbookStorage.prototype.deleteAddressbook = async () => {};
});

afterEach(() => {
  appGlobal.addressbooks.clear();
});

/** An address book as Stalwart returns it */
function serverAddressbook(id: string, name: string, isDefault = false): TJMAPAddressbook {
  return {
    id, name, description: null, sortOrder: 0, isDefault, isSubscribed: true, shareWith: {},
    myRights: { mayRead: true, mayWrite: true, mayDelete: true, mayShare: true },
  } as any;
}

let onServer: TJMAPAddressbook[];

function setup(): JMAPAccount {
  let account = new JMAPAccount();
  account.name = "alice@example.com";
  account.accountID = "a";
  account.makeSingleCall = async (method: string, args: any) => {
    expect(method).toBe("AddressBook/get");
    return { accountId: args.accountId, state: "a1", list: onServer, notFound: [] };
  };
  return account;
}

function addressbooks(account: JMAPAccount): string[] {
  return appGlobal.addressbooks.contents
    .filter(ab => ab.mainAccount == account)
    .map(ab => (ab as JMAPAddressbook).jmapID + ": " + ab.name);
}

test("An address book renamed elsewhere gets the new name", async () => {
  let account = setup();
  onServer = [serverAddressbook("b", "Default", true), serverAddressbook("c", "Team")];
  await account.listAddressbooks();
  onServer = [serverAddressbook("b", "Default", true), serverAddressbook("c", "Team Berlin")];
  await account.listAddressbooks();
  expect(addressbooks(account)).toEqual(["b: alice@example.com", "c: Team Berlin"]);
});

test("An address book deleted elsewhere is removed here", async () => {
  let account = setup();
  onServer = [serverAddressbook("b", "Default", true), serverAddressbook("c", "Team")];
  await account.listAddressbooks();
  onServer = [serverAddressbook("b", "Default", true)];
  await account.listAddressbooks();
  expect(addressbooks(account)).toEqual(["b: alice@example.com"]);
});

test("A new address book is added and listed when the server tells about it", async () => {
  let account = setup();
  onServer = [serverAddressbook("b", "Default", true)];
  await account.listAddressbooks();
  let listed: string[] = [];
  JMAPAddressbook.prototype.syncOnStartup = async function () { listed.push(this.jmapID); };
  onServer = [serverAddressbook("b", "Default", true), serverAddressbook("d", "New")];
  await account.sync("AddressBook", "a2");
  expect(addressbooks(account)).toEqual(["b: alice@example.com", "d: New"]);
  expect(listed).toEqual(["d"]);
});
