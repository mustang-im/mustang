import { Addressbook } from "../Addressbook";
import { JMAPPerson } from "./JMAPPerson";
import { JMAPGroup } from "./JMAPGroup";
import type { JMAPAccount } from "../../Mail/JMAP/JMAPAccount";
import type { TJMAPAddressbook } from "./TJMAPAddressbook";
import type { TJMAPContact } from "./TJSContact";
import type { TJMAPChangeResponse, TJMAPGetResponse } from "../../Mail/JMAP/TJMAPGeneric";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl, Collection } from "svelte-collections";

export class JMAPAddressbook extends Addressbook {
  readonly protocol: string = "addressbook-jmap";
  canSync: boolean = true;
  declare readonly persons: ArrayColl<JMAPPerson>;
  declare readonly groups: ArrayColl<JMAPGroup>;
  readonly deletions = new Set<string>();

  get account(): JMAPAccount {
    return this.mainAccount as JMAPAccount;
  }

  newPerson(): JMAPPerson {
    return new JMAPPerson(this);
  }
  newGroup(): JMAPGroup {
    return new JMAPGroup(this);
  }

  get isLoggedIn(): boolean {
    return this.account.isLoggedIn;
  }

  async login(interactive: boolean) {
    if (this.isLoggedIn) {
      return;
    }
    await this.account.login(interactive);
  }

  fromJMAP(jmap: TJMAPAddressbook) {
    this.id = sanitize.nonemptystring(jmap.id);
    this.name = sanitize.nonemptystring(jmap.name);
  }

  async listContacts() {
    await super.listContacts();
    if (!this.account.isLoggedIn) {
      await this.account.login(false);
    }
    // Reading from DB happens on startup, in `Addressbooks.ts readAddressbooks()`

    this.persons.isEmpty
      ? await this.listAllPersons()
      : await this.listChangedPersons();
  }

  /** Lists all persons in this addressbook. */
  protected async listAllPersons(): Promise<ArrayColl<JMAPPerson>> {
    const batchSize = 200;
    let hasMore = true;
    let allNewPersons = new ArrayColl<JMAPPerson>();
    for (let i = 0; hasMore; i += batchSize) {
      let { newPersons, updatedPersons } = await this.fetchPersons(i, batchSize + 1);
      this.persons.addAll(newPersons);
      await this.savePersons(newPersons);
      allNewPersons.addAll(newPersons);
      hasMore = newPersons.length + updatedPersons.length > batchSize;
    }
    return allNewPersons;
  }

  protected async fetchPersons(start?: number, limit?: number, options?: any): Promise<UpdateResult<JMAPPerson>> {
    console.log("JMAP fetch", limit || start ? `start ${start} limit ${limit}` : "all");
    let listResponse: TJMAPGetResponse<TJMAPContact>;
    let lock = await this.account.stateLock.lock();
    try {
      // <https://www.rfc-editor.org/rfc/rfc8621.html#section-4.4>
      let response = await this.account.makeCombinedCall([
        [
          "ContactCard/query", {
            accountId: this.account.accountID,
            filter: {
              inAddressBook: this.id,
            },
            sort: [
              { property: "created" }
            ],
            position: start,
            limit: limit,
          },
          "list",
        ], [
          "ContactCard/get", {
            accountId: this.account.accountID,
            "#ids": {
              name: "ContactCard/query",
              path: "/ids",
              resultOf: "list",
            },
          },
          "persons",
        ],
      ]);
      listResponse = response["persons"] as TJMAPGetResponse<TJMAPContact>;

      let result = this.parsePersonsList(listResponse.list);
      this.account.syncState.set("ContactCard", listResponse.state);
      return result;
    } finally {
      lock.release();
    }
  }

  /** Lists all persons in this addressbook that are new or updated since the last fetch. */
  protected async listChangedPersons(): Promise<ArrayColl<JMAPPerson>> {
    if (!this.account.syncState.has("ContactCard")) {
      return await this.listAllPersons();
    }

    return await this.fetchChangedPersonsForAllAddressbooks();
  }

  /**
   * Checks new persons for *all* addressbooks in this account,
   * and updates *all* addressbooks.
   * @returns new persons of *this* addressbook
   */
  async fetchChangedPersonsForAllAddressbooks(): Promise<ArrayColl<JMAPPerson>> {
    assert(this.account.syncState.has("ContactCard"), "No sync state");
    let lock = await this.account.stateLock.lock();
    try {
      if (lock.wasWaiting && false) { // TODO always true
        console.log("JMAP fetch changes for folder", this.name, "already in progress");
        return new ArrayColl();
      }
      //console.log("JMAP fetching changes for folder", this.name);
      // <https://www.rfc-editor.org/rfc/rfc8620#section-5.2>
      let response = await this.account.makeCombinedCall([
        [
          "ContactCard/changes", {
            accountId: this.account.accountID,
            sinceState: this.account.syncState.get("ContactCard"),
            maxChanges: 500,
          },
          "changes",
        ], [
          "ContactCard/get", {
            accountId: this.account.accountID,
            "#ids": {
              resultOf: "changes",
              name: "ContactCard/changes",
              path: "/created",
            },
          },
          "added",
        ], [
          "ContactCard/get", {
            accountId: this.account.accountID,
            "#ids": {
              resultOf: "changes",
              name: "ContactCard/changes",
              path: "/updated",
            },
          },
          "changed",
        ],
      ]);
      //console.log("sync response", response);

      let changes = response["changes"] as TJMAPChangeResponse;
      let addedResponse = response["added"] as TJMAPGetResponse<TJMAPContact>;
      let changedResponse = response["changed"] as TJMAPGetResponse<TJMAPContact>;

      // Now, split the responses by folder
      let addedResponseByAB = new Map<string, TJMAPContact[]>();
      let changedResponseByAB = new Map<string, TJMAPContact[]>();
      let newPersonsOfThisAB = new ArrayColl<JMAPPerson>();
      splitByAddressbook(addedResponse.list, addedResponseByAB);
      splitByAddressbook(changedResponse.list, changedResponseByAB);

      let allAddressbooks = this.account.dependentAccounts().filterOnce(a => a instanceof JMAPAddressbook) as Collection<JMAPAddressbook>;
      for (let addressbook of allAddressbooks) {
        let removedPersons = await addressbook.parseRemovedPersons(changes.destroyed)
        if (!addedResponseByAB.get(addressbook.id) && !changedResponseByAB.get(addressbook.id)) {
          continue;
        }
        let addedResult = addressbook.parsePersonsList(addedResponseByAB.get(addressbook.id) ?? [], false);
        let changedResult = addressbook.parsePersonsList(changedResponseByAB.get(addressbook.id) ?? []);
        addedResult.newPersons.addAll(changedResult.newPersons);
        //console.log(addressbook.name, "added persons", addedResult.newPersons.contents.map(p => p.subject));
        //console.log(addressbook.name, "updates persons", changedResult.updatedPersons.contents.map(p => p.subject));
        //console.log(addressbook.name, "removed persons", removedPersons.contents.map(p => p.name));

        addressbook.persons.removeAll(removedPersons);
        addressbook.persons.addAll(addedResult.newPersons);
        await this.savePersons(changedResult.updatedPersons);
        await this.savePersons(addedResult.newPersons);
        if (this === addressbook) {
          newPersonsOfThisAB = addedResult.newPersons;
        }
      }

      this.account.syncState.set("ContactCard", changes.newState);
      if (changes.hasMoreChanges) {
        lock.release();
        await this.fetchChangedPersonsForAllAddressbooks();
      }
      return newPersonsOfThisAB;
    } finally {
      lock.release();
    }
  }

  protected async parseRemovedPersons(personIDs: string[]): Promise<ArrayColl<JMAPPerson>> {
    let removedPersons = new ArrayColl<JMAPPerson>();
    for (let removedID of personIDs) {
      let person = this.getPersonByID(removedID);
      if (!person) {
        continue;
      }
      removedPersons.add(person);
      await person.deleteLocally();
    }
    return removedPersons;
  }

  protected parsePersonsList(msgs: TJMAPContact[], checkUpdates = true): UpdateResult<JMAPPerson> {
    let newPersons = new ArrayColl<JMAPPerson>();
    let updatedPersons = new ArrayColl<JMAPPerson>();
    for (let json of msgs) {
      let id = sanitize.nonemptystring(json.id);
      if (this.deletions.has(id)) {
        continue;
      }
      let msg = checkUpdates && this.getPersonByID(id);
      if (msg) {
        msg.fromJMAP(json);
        updatedPersons.add(msg);
      } else {
        msg = this.newPerson();
        msg.fromJMAP(json);
        newPersons.add(msg);
      }
    }
    return { newPersons: newPersons, updatedPersons: updatedPersons };
  }

  protected async savePersons(persons: Collection<JMAPPerson>) {
    for (let person of persons) {
      await person.save();
    }
  }

  protected getPersonByID(id: string): JMAPPerson | undefined {
    return this.persons.find(p => p.id == id);
  }

  protected getGroupByID(id: string): JMAPGroup | undefined {
    return this.groups.find(p => p.itemID == id);
  }

  /*fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    return json;
  }*/
}

type UpdateResult<T> = { newPersons: ArrayColl<T>, updatedPersons: ArrayColl<T> }

function splitByAddressbook(list: TJMAPContact[], map: Map<string, TJMAPContact[]>) {
  for (let resp of list) {
    for (let addressbookID in resp.addressBookIds) {
      let list = map.get(addressbookID);
      if (!list) {
        list = [];
        map.set(addressbookID, list);
      }
      list.push(resp);
    }
  }
}
