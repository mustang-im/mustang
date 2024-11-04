import { Person } from "../../Abstract/Person";
import { assert } from "../../util/util";

export class AcePerson {
  static readonly refBranch = "contacts/personContact";

  static ref(person: Person): string {
    assert(person.id, "Need person.id");
    return this.refBranch + "/" + person.id;
  }

  static async save(person: Person) {
  }

  static async deleteIt(person: Person) {

  }

  static async read(): Promise<Person> {

  }
}