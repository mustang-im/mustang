// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import type { JMAPFolder } from "../../../../logic/Mail/JMAP/JMAPFolder";
import type { JMAPEMail } from "../../../../logic/Mail/JMAP/JMAPEMail";
import type { TJMAPSession } from "../../../../logic/Mail/JMAP/TJMAPGeneric";
import { DummyMailStorage } from "../../../../logic/Mail/Store/DummyMailStorage";
import { ArrayColl } from "svelte-collections";
import { expect, test } from "vitest";

/** Small, so that the test needs only a few emails. Stalwart's is 500. */
const kMaxObjectsInSet = 3;

/** A JMAP server that rejects an `Email/set` with too many objects, like Stalwart */
class TestJMAPAccount extends JMAPAccount {
  /** The `update` argument of each `Email/set` */
  readonly updates: Record<string, Record<string, boolean | null>>[] = [];
  async makeSingleCall(method: string, args: Record<string, any>): Promise<Record<string, any>> {
    expect(method).toBe("Email/set");
    let ids = Object.keys(args.update);
    if (ids.length > kMaxObjectsInSet) {
      let ex = new Error("The number of ids requested by the client exceeds the maximum number the server is willing to process in a single method call.") as any;
      ex.code = "requestTooLarge";
      throw ex;
    }
    this.updates.push(args.update);
    return { updated: Object.fromEntries(ids.map(id => [id, null])) };
  }
}

function setUp(emailCount: number) {
  appGlobal.remoteApp = { kyCreate: () => null } as any;
  let account = new TestJMAPAccount();
  account.accountID = "u1";
  account.session = {
    capabilities: {
      "urn:ietf:params:jmap:core": { maxObjectsInSet: kMaxObjectsInSet },
    },
  } as any as TJMAPSession;
  account.storage = new DummyMailStorage();
  let source = addFolder(account, "source");
  let target = addFolder(account, "target");
  (target as any).listChangedMessages = async () => new ArrayColl();
  for (let i = 1; i <= emailCount; i++) {
    let email = source.newEMail() as JMAPEMail;
    email.jmapID = "m" + i;
    source.messages.add(email);
  }
  return { account, source, target };
}

function addFolder(account: JMAPAccount, id: string): JMAPFolder {
  let folder = account.newFolder() as JMAPFolder;
  folder.id = id;
  folder.name = id;
  account.rootFolders.add(folder);
  return folder;
}

test("Moving more emails than the server takes in one Email/set moves all of them", async () => {
  let { account, source, target } = setUp(7);
  let emails = new ArrayColl(source.messages.contents);

  await target.moveMessagesHere(emails);

  expect(account.updates.map(update => Object.keys(update).length)).toEqual([3, 3, 1]);
  let all = Object.assign({}, ...account.updates);
  expect(Object.keys(all).sort()).toEqual(["m1", "m2", "m3", "m4", "m5", "m6", "m7"]);
  for (let id in all) {
    expect(all[id]).toEqual({ "mailboxIds/target": true, "mailboxIds/source": null });
  }
  expect(source.messages.length).toBe(0);
});

test("Copying more emails than the server takes in one Email/set copies all of them", async () => {
  let { account, source, target } = setUp(4);
  let emails = new ArrayColl(source.messages.contents);

  await target.copyMessagesHere(emails);

  expect(account.updates.map(update => Object.keys(update).length)).toEqual([3, 1]);
  let all = Object.assign({}, ...account.updates);
  expect(Object.keys(all).sort()).toEqual(["m1", "m2", "m3", "m4"]);
  for (let id in all) {
    expect(all[id]).toEqual({ "mailboxIds/target": true, "mailboxIds/source": true });
  }
  expect(source.messages.length).toBe(4);
});

test("Moving a few emails is one Email/set", async () => {
  let { account, source, target } = setUp(kMaxObjectsInSet);

  await target.moveMessagesHere(new ArrayColl(source.messages.contents));

  expect(account.updates.length).toBe(1);
  expect(Object.keys(account.updates[0]).length).toBe(kMaxObjectsInSet);
});
