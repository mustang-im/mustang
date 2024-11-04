import { Group } from "../../Abstract/Group";
import { assert } from "../../util/util";

export class AceGroup {
  static readonly refBranch = "contacts/group";

  static ref(group: Group): string {
    assert(group.id, "Need group.id");
    return this.refBranch + "/" + group.id;
  }

  static async save(group: Group) {
    
  }

  static async delete(group: Group) {
  }

  static async read() {
    
  }
}