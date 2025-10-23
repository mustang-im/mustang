import { Addressbook } from "../Addressbook";
import { JMAPPerson } from "./JMAPPerson";
import { JMAPGroup } from "./JMAPGroup";
import type { JMAPAccount } from "../../Mail/JMAP/JMAPAccount";
import type { TJMAPAddressbook } from "./JMAPContactTypes";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { ArrayColl } from "svelte-collections";

export class JMAPAddressbook extends Addressbook {
  readonly protocol: string = "addressbook-jmap";
  canSync: boolean = true;
  declare readonly persons: ArrayColl<JMAPPerson>;
  declare readonly groups: ArrayColl<JMAPGroup>;

  get account(): JMAPAccount {
    return this.mainAccount as JMAPAccount;
  }

  newPerson(): JMAPPerson {
    return new JMAPPerson(this);
  }
  newGroup(): JMAPGroup {
    return new JMAPGroup(this);
  }

  fromJMAP(jmap: TJMAPAddressbook) {
    this.id = sanitize.nonemptystring(jmap.id);
    this.name = sanitize.nonemptystring(jmap.name);
  }

  async listContacts() {
    if (!this.dbID) {
      await this.save();
    }

    return this.updateChangedContacts();
  }

  // Uses the sync state to get just the contacts that changed since last time.
  protected async updateChangedContacts() {
  }

  async listPersons(persons: any[]) {
  }

  protected getPersonByItemID(id: string): JMAPPerson | undefined {
    return this.persons.find(p => p.uid == id);
  }

  async listGroups(groups: any[]) {
  }

  protected getGroupByItemID(id: string): JMAPGroup | undefined {
    return this.groups.find(p => p.itemID == id);
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.folderID = sanitize.string(json.folderID, null);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.folderID = this.folderID;
    return json;
  }
}
