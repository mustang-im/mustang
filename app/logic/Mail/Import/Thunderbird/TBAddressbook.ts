import { Addressbook } from "../../../Contacts/Addressbook";
import type { ThunderbirdProfile } from "./TBProfile";
import { ContactEntry, Person } from "../../../Abstract/Person";
import { appGlobal } from "../../../app";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { ArrayColl } from "svelte-collections";
import sql, { Database } from "../../../../../lib/rs-sqlite";

export class ThunderbirdAddressbook extends Addressbook {
  readonly protocol: string = "thunderbird-addressbook-sqlite";

  static async read(profile: ThunderbirdProfile, dbFilename: string, name: string,
    entryErrorCallback: (ex: Error) => void): Promise<ThunderbirdAddressbook> {
    //console.log("Reading ", name, "file", dbFilename);
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
    let fallbackID = 0;
    for (let card of cards) {
      try {
        let id = sanitize.alphanumdash(card.card, "" + ++fallbackID);
        let emailAddress = sanitize.emailAddress(card.value);
        let values = rows.filter(row => row.card == id);
        let person = new Person();
        person.id = id;
        person.name = sanitize.nonemptystring(values.find(row => row.name == "DisplayName")?.value, emailAddress);
        person.firstName = sanitize.string(values.find(row => row.name == "FirstName")?.value, null);
        person.lastName = sanitize.string(values.find(row => row.name == "LastName")?.value, null);
        let entry = new ContactEntry(emailAddress, "main");
        entry.protocol = "email";
        entry.preference = 0;
        person.emailAddresses.add(entry);
        ab.persons.add(person);
      } catch (ex) {
        entryErrorCallback(ex);
      }
    }

    return ab;
  }

  static async readAll(profile: ThunderbirdProfile,
    abErrorCallback: (ex: Error) => void,
    entryErrorCallback: (ex: Error) => void):
    Promise<ArrayColl<ThunderbirdAddressbook>> {
    await profile.readPrefs();
    let addressbooks = new ArrayColl<ThunderbirdAddressbook>();
    for (let key in profile.prefs) {
      if (!(key.startsWith("ldap_2.servers.") && key.endsWith(".filename"))) {
        continue;
      }
      try {
        let filename = sanitize.nonemptystring(profile.prefs[key]);
        if (!filename.endsWith(".sqlite")) {
          continue;
        }
        let serverID = key.slice("ldap_2.servers.".length, -(".filename".length));
        let name = sanitize.string(profile.prefs[`ldap_2.servers.${serverID}.description`], "Old addressbook");
        let ab = await this.read(profile, filename, name, entryErrorCallback);
        addressbooks.add(ab);
      } catch (ex) {
        abErrorCallback(ex);
      }
    }
    return addressbooks;
  }

  static async getDatabase(profile: ThunderbirdProfile, dbFilename: string): Promise<Database> {
    let filePath = await appGlobal.remoteApp.path.join(profile.path, dbFilename);
    return await appGlobal.remoteApp.getSQLiteDatabase(filePath, { readonly: true, timeout: 200 });
  }
}
