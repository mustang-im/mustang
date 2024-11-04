import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { Group } from "../../Abstract/Group";
import { Person } from "../../Abstract/Person";
import { appGlobal } from "../../app";
import { assert } from "../../util/util";

export class JSONGroup {
  static save(group: Group): any {
    assert(group.id, "Need group ID to save");
    let json: any = {};
    json.name = group.name;
    json.description = group.description;
    json.pID = group.id;
    json.addressbookID = group.addressbook?.dbID;
    this.saveMembers(group, json)
    return json;
  }

  static saveMembers(group: Group, json: any) {
    json.groupMembers = group.participants.map(p => this.saveMember(p));
  }

  static saveMember(person: Person) {
    let json: any = {};
    json.personID = person.dbID;
    return json;
  }

  static read(dbID: number, group: Group, json: any): Group {
    group.dbID = sanitize.integer(dbID);
    group.name = sanitize.label(json.name);
    group.description = sanitize.string(json.description, "");
    group.id = sanitize.string(json.pID, null);
    if (json.addressbookID) {
      let addressbookID = sanitize.integer(json.addressbookID);
      if (group.addressbook) {
        assert(group.addressbook.dbID == addressbookID, "Wrong addressbook");
      } else {
        group.addressbook = appGlobal.addressbooks.find(ab => ab.dbID == addressbookID);
      }
    }
    return group;
  }
}