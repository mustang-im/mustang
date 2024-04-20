import { Addressbook } from "../../../Contacts/Addressbook";
import { ThunderbirdProfile } from "./TBProfile";
import { ContactEntry, Person } from "../../../Abstract/Person";
import { appGlobal } from "../../../app";
import { backgroundError } from "../../../../frontend/Util/error";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { ArrayColl } from "svelte-collections";
import sql, { Database } from "../../../../../lib/rs-sqlite";
import { assert } from "../../../util/util";

export class ThunderbirdAddressbook extends Addressbook {
  readonly protocol: string = "thunderbird-addressbook-sqlite";

  static async read(profile: ThunderbirdProfile, dbFilename: string, name: string): Promise<ThunderbirdAddressbook> {
    let ab = new ThunderbirdAddressbook();
    ab.id = "tb-" + dbFilename;
    ab.name = name;

    let db = await this.getDatabase(profile, dbFilename);
    let rows = await db.all(sql`
      SELECT
        card, name, value
      FROM properties
      `) as any;
    let cards = rows.filter(row => row.name == "PrimaryEmail");
    for (let card of cards) {
      try {
        let id = sanitize.alphanumdash(card.card);
        let emailAddress = sanitize.emailAddress(card.value);
        let values = rows.filter(row => row.card == id);
        let person = new Person();
        person.id = id;
        person.name = values.find(row => row.name == "DisplayName")?.value ??
          emailAddress;
        person.firstName = values.find(row => row.name == "FirstName")?.value;
        person.lastName = values.find(row => row.name == "LastName")?.value;
        let entry = new ContactEntry(emailAddress, "main");
        entry.protocol = "email";
        entry.preference = 0;
        person.emailAddresses.add(entry);
        ab.persons.add(person);
      } catch (ex) {
        backgroundError(ex);
      }
    }

    return ab;
  }

  static async readAll(profile: ThunderbirdProfile): Promise<ArrayColl<ThunderbirdAddressbook>> {
    await profile.readPrefs();
    let addressbooks = new ArrayColl<ThunderbirdAddressbook>();
    for (let key in profile.prefs) {
      if (!(key.startsWith("ldap_2.servers.") && key.endsWith(".filename"))) {
        continue;
      }
      try {
        let filename = sanitize.nonemptystring(profile.prefs[key]);
        let serverID = key.slice("ldap_2.servers.".length, -(".filename".length));
        let name = sanitize.stringOrNull(profile.prefs[`"ldap_2.servers.${serverID}.description"`]) ?? "Old addressbook";
        let ab = await this.read(profile, filename, name);
        addressbooks.add(ab);
      } catch (ex) {
        console.error(ex);
      }
    }
    return addressbooks;
  }

  static async getDatabase(profile: ThunderbirdProfile, dbFilename: string): Promise<Database> {
    let filePath = await appGlobal.remoteApp.path.join(profile.path, dbFilename);
    return await appGlobal.remoteApp.getSQLiteDatabase(filePath);
  }
}