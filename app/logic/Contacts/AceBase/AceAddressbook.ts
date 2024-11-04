import type { Addressbook } from "../Addressbook";
import { assert } from "../../util/util";
import { JSONAddressbook } from "../JSON/JSONAddressbook";
import { getDatabase } from "./AceDatabase";

export class AceAddressbook {
  static readonly refBranch = "contacts/addressbook";
  static ref(acc: Addressbook): string {
    assert(acc.id, "Need account.id");
    return this.refBranch + "/" + acc.id;
  }

  static async save(acc: Addressbook) {
    let json = JSONAddressbook.save(acc);
    let db = await getDatabase();
    await db.set(this.ref(acc), json);
  }

  static async read(acc: Addressbook, json: any) {
    if (!json) {
      let db = await getDatabase();
      json = await db.get(this.ref(acc));
    }
    JSONAddressbook.read(acc, json);
  }

  static async deleteIt(acc: Addressbook) {
    let db = await getDatabase();
    await db.remove(this.ref(acc));
  }
}