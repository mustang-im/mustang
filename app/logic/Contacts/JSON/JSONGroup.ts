import { Group } from "../../Abstract/Group";
import { Person } from "../../Abstract/Person";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { backgroundError } from "../../../frontend/Util/error";
import { assert } from "../../util/util";
import { appGlobal } from "../../app";

export class JSONGroup {
  static save(group: Group): any {
    assert(group.addressbook?.dbID, "Need address book ID to save the group");
    let json: any = {};
    json.id = group.id;
    json.name = group.name;
    json.description = group.description;
    json.addressbookID = group.addressbook?.dbID;
    return json;
  }

  static saveMembers(group: Group, json: any): any {
    json.members = [];
    for (let person of group.participants) {
      assert(person.dbID, "Need person ID to save the member");
      json.members.push(person.dbID);
    }
    return json;
  }

  static read(dbID: number, group: Group, json: any): Group {
    group.dbID = sanitize.integer(dbID);
    group.name = sanitize.label(json.name);
    group.description = sanitize.label(json.description, "");
    group.id = sanitize.string(json.id, null);
    if (json.addressbookID) {
      let addressbookID = sanitize.integer(json.addressbookID);
      if (group.addressbook) {
        assert(group.addressbook.dbID == addressbookID, "Wrong addressbook");
      } else {
        group.addressbook = appGlobal.addressbooks.find(ab => ab.dbID == addressbookID);
      }
    }

    JSONGroup.readMembers(group, json);
    return group;
  }

  static readMembers(group: Group, json: any){
    for (let member of json.members) {
      try {
        let personID = sanitize.integer(member);
        let person = group.addressbook?.persons.find(p => p.dbID == personID) as Person;
        if (!person) {
          for (let ab of appGlobal.addressbooks) {
            person = ab.persons.find(p => p.dbID == personID);
            if (person) {
              break;
            }
          }
        }
        group.participants.add(person);
      } catch (ex) {
        backgroundError(ex);
      }
    }
  }
}