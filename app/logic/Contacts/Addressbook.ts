import { Person } from "../Abstract/Person";
import { Group } from "../Abstract/Group";
import type { Contact } from "../Abstract/Contact";
import type { AddressbookAccount } from "./AddressbookAccount";
import type { MailAccount } from "../Mail/MailAccount";
import { getWorkspaceByID, type Workspace } from "../Abstract/Workspace";
import { appGlobal } from "../app";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { ArrayColl, Collection, mergeColl } from "svelte-collections";
import { assert } from "../util/util";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import type { ComponentType } from "svelte";

export class Addressbook extends Observable {
  readonly protocol: string = "addressbook-local";
  account: AddressbookAccount | MailAccount;

  canSync: boolean = false;
  readonly persons = new ArrayColl<Person>();
  readonly groups = new ArrayColl<Group>();
  readonly contacts: Collection<Contact> = mergeColl(this.persons as Collection<Contact>, this.groups as Collection<Contact>);
  storage: AddressbookStorage | null = null;
  syncState: string | null = null;

  // Meta data
  id: string;
  /** The primary ID in the database */
  dbID: number | string | null = null;
  @notifyChangedProperty
  name: string;
  /** A `data:` URL to an image that represents this account.
   * E.g. the company logo. */
  @notifyChangedProperty
  icon: string | ComponentType | null = null;
  @notifyChangedProperty
  color: string = "#FFFFFF";
  @notifyChangedProperty
  workspace: Workspace | null = null;
  /** Show this addressbook in our UI.
   * If false, pretend that this addressbook and the persons and groups in it don't exist.
   * If false, this addressbook should *not* appear in `appGlobal.addressbooks`
   * and its persons should *not* appear in `appGlobal.persons`. */
  @notifyChangedProperty
  enabled: boolean = true;

  newPerson(): Person {
    return new Person(this);
  }
  newGroup(): Group {
    return new Group(this);
  }

  async listContacts() {
  }

  async save(): Promise<void> {
    await this.storage?.saveAddressbook(this);
  }

  async deleteIt(): Promise<void> {
    await this.storage?.deleteAddressbook(this);
    appGlobal.addressbooks.remove(this);
  }

  toConfigJSON(): any {
    assert(this.id, "Need calendar ID to save");
    let json = {} as any;
    json.id = this.id;
    json.protocol = this.protocol;
    json.name = this.name;
    json.workspaceID = this.workspace?.id;
    json.color = this.color;
    json.icon = this.icon;
    json.syncState = this.syncState;
    return json;
  }
  fromConfigJSON(json: any) {
    assert(typeof (json) == "object", "Config must be a JSON object");
    assert(this.protocol == sanitize.alphanumdash(json.protocol), `Calendar object of wrong type passed in: data ${json.protocol} != class ${this.protocol}`);
    (this.id as any) = sanitize.alphanumdash(json.id);
    this.name = sanitize.label(json.name, this.account.name);
    this.color = sanitize.nonemptystring(json.color, this.color);
    this.icon = sanitize.url(json.icon, null, ["data"]);
    this.workspace = getWorkspaceByID(sanitize.string(json.workspaceID, null));
    this.syncState = json.syncState;
  }
}

export interface AddressbookStorage {
  savePerson(person: Person): Promise<void>;
  deletePerson(person: Person): Promise<void>;
  saveGroup(group: Group): Promise<void>;
  deleteGroup(group: Group): Promise<void>;
  saveAddressbook(addressbook: Addressbook): Promise<void>;
  deleteAddressbook(addressbook: Addressbook): Promise<void>;
}
