import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import type { TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import type { PersonUID } from "../../../../logic/Abstract/PersonUID";
import { expect, test } from "vitest";

appGlobal.remoteApp = { kyCreate: () => null } as any;

// Our own account, and two accounts that others shared with us
const kSession = {
  capabilities: {
    "urn:ietf:params:jmap:mail": {},
    "urn:ietf:params:jmap:principals": {},
  },
  primaryAccounts: {
    "urn:ietf:params:jmap:mail": "r",
    "urn:ietf:params:jmap:principals": "r",
  },
  accounts: {
    r: { name: "core-bob@example.com", isPersonal: true, isReadOnly: false, accountCapabilities: { "urn:ietf:params:jmap:mail": {} } },
    q: { name: "core-alice@example.com", isPersonal: false, isReadOnly: false, accountCapabilities: { "urn:ietf:params:jmap:mail": {} } },
    s: { name: "core-carol@example.com", isPersonal: false, isReadOnly: false, accountCapabilities: { "urn:ietf:params:jmap:mail": {} } },
  },
  state: "45b2a26c",
} as any as TJMAPSession;

/** Like Stalwart's, when alice shared a folder with bob */
function notification(id: string, objectAccountId: string) {
  return {
    id,
    created: "2026-10-18T00:20:00Z",
    changedBy: { name: "core-alice@example.com", email: "core-alice@example.com", principalId: objectAccountId },
    objectType: "Mailbox",
    objectAccountId,
    objectId: "h",
    oldRights: null,
    newRights: { mayReadItems: true },
    name: "core-share-session",
  };
}

/** A server that returns the new share notifications in several `/changes` steps */
class TestJMAPAccount extends JMAPAccount {
  readonly added: string[] = [];
  readonly sinceStates: string[] = [];
  steps = [
    { changes: { oldState: "n1", newState: "n2", hasMoreChanges: true, created: ["a1"], updated: [], destroyed: [] }, new: { list: [notification("a1", "q")] } },
    { changes: { oldState: "n2", newState: "n3", hasMoreChanges: false, created: ["a2"], updated: [], destroyed: [] }, new: { list: [notification("a2", "s")] } },
  ];
  async makeCombinedCall(calls: [string, Record<string, any>, string?][]): Promise<Record<string, any>> {
    this.sinceStates.push(calls[0][1].sinceState);
    return this.steps.shift();
  }
  async getSession(): Promise<void> {
  }
  async save(): Promise<void> {
  }
  async addSharedFolders(person: PersonUID): Promise<JMAPAccount> {
    this.added.push(person.emailAddress);
    return null;
  }
}

test("Share notifications that the server returns in several steps all add their account", async () => {
  let account = new TestJMAPAccount();
  account.accountID = "r";
  account.session = kSession;
  account.syncState.set("ShareNotification", "n1");

  await account.addNewlySharedAccounts();

  expect(account.added).toEqual(["core-alice@example.com", "core-carol@example.com"]);
  expect(account.sinceStates).toEqual(["n1", "n2"]);
  expect(account.syncState.get("ShareNotification")).toBe("n3");
});

test("A step without new share notifications continues with the next step", async () => {
  let account = new TestJMAPAccount();
  account.accountID = "r";
  account.session = kSession;
  account.syncState.set("ShareNotification", "n1");
  account.steps[0].changes.created = [];
  account.steps[0].changes.destroyed = ["a0"];
  account.steps[0].new.list = [];

  await account.addNewlySharedAccounts();

  expect(account.added).toEqual(["core-carol@example.com"]);
  expect(account.syncState.get("ShareNotification")).toBe("n3");
});
