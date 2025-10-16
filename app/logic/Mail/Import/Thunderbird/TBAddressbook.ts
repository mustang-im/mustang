import { Addressbook } from "../../../Contacts/Addressbook";
import type { ThunderbirdProfile } from "./TBProfile";
import { ContactEntry, Person } from "../../../Abstract/Person";
import { StreetAddress } from "../../../Contacts/StreetAddress";
import { appGlobal } from "../../../app";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { NotReached, UserError, randomID } from "../../../util/util";
import { ArrayColl, SetColl } from "svelte-collections";
import sql, { type Database } from "../../../../../lib/rs-sqlite";
import { getSQLiteDatabase } from "../../../util/backend-wrapper";

export class ThunderbirdAddressbook extends Addressbook {
  static async read(profile: ThunderbirdProfile, dbFilename: string, name: string,
    entryErrorCallback: (ex: Error) => void): Promise<ThunderbirdAddressbook> {
    //console.log("Reading ", name, "file", dbFilename);
    let ab = new ThunderbirdAddressbook();
    ab.id = "tb-" + dbFilename.replace(/\..*/, "ä.").replace(/[^a-zA-Z0-9\-]/g, "");
    ab.name = name;

    let db = await this.getDatabase(profile, dbFilename);
    let rows = await db.all(sql`
      SELECT
        card as cardID, name, value
      FROM properties
      `) as any;
    let ids = new SetColl<string>();
    for (let row of rows) {
      ids.add(row.cardID);
    }
    for (let id of ids) {
      try {
        id = sanitize.alphanumdash(id);
        let personRows = rows.filter(row => row.cardID == id);
        let person = this.readCard(id, personRows, ab);
        ab.persons.add(person);
      } catch (ex) {
        entryErrorCallback(ex);
      }
    }

    if (ab.persons.isEmpty) {
      throw new UserError("No persons found");
    }
    return ab;
  }

  protected static readCard(id: string, rows: any[], addressbook: Addressbook): Person {
    function getRow(name: string): string | null {
      return rows.find(row => row.name == name)?.value;
    }
    function addContact(contact: string, protocol: string, purpose: string, preference: number, addTo: ArrayColl<ContactEntry>) {
      if (!contact) {
        return;
      }
      let entry = new ContactEntry(contact);
      entry.purpose = purpose;
      entry.protocol = protocol;
      entry.preference = preference;
      addTo.add(entry);
    }

    let person = addressbook.newPerson();
    person.id = id ?? randomID();
    let emailAddress = sanitize.emailAddress(getRow("PrimaryEmail"), null);

    // Name
    person.firstName = sanitize.nonemptystring(getRow("FirstName"), null);
    person.lastName = sanitize.nonemptystring(getRow("LastName"), null);
    person.name = sanitize.nonemptystring(getRow("DisplayName"), null);
    if (person.name) {
      // Good
    } else if (person.firstName || person.lastName) {
      person.name =
        person.firstName +
        (person.firstName && person.lastName ? " " : "") +
        person.lastName;
    } else if (emailAddress) {
      person.name = emailAddress;
    } else {
      throw new NotReached("Need either name or email address for contact");
    }

    person.notes = sanitize.nonemptystring(getRow("Notes"), null);
    person.popularity = sanitize.integer(getRow("PopularityIndex"), 0);
    let photo = getRow("PhotoURI");
    if (photo && getRow("PhotoType") != "generic" && !photo.startsWith("chrome:")) {
      person.picture = sanitize.url(photo, null);
    }

    // Company
    person.company = sanitize.nonemptystring(getRow("Company"), null);
    person.department = sanitize.nonemptystring(getRow("Department"), null);
    person.position = sanitize.nonemptystring(getRow("JobTitle"), null);

    // Mail
    addContact(emailAddress, "email", "main", 0, person.emailAddresses);
    addContact(sanitize.emailAddress(getRow("SecondEmail"), null), "email", "second", 1, person.emailAddresses);

    // Phone
    addContact(sanitize.nonemptystring(getRow("CellularNumber"), null), "phone", "mobile", 1, person.phoneNumbers);
    addContact(sanitize.nonemptystring(getRow("WorkPhone"), null), "phone", "work", 2, person.phoneNumbers);
    addContact(sanitize.nonemptystring(getRow("HomePhone"), null), "phone", "home", 3, person.phoneNumbers);
    addContact(sanitize.nonemptystring(getRow("FaxNumber"), null), "fax", "work", 100, person.phoneNumbers);
    addContact(sanitize.nonemptystring(getRow("PagerNumber"), null), "other", "work", 100, person.phoneNumbers);

    // URLs
    addContact(sanitize.nonemptystring(getRow("WebPage1"), null), "url", "web", 1, person.urls);
    addContact(sanitize.nonemptystring(getRow("WebPage2"), null), "url", "web", 2, person.urls);

    // Chat
    addContact(sanitize.nonemptystring(getRow("_AimScreenName"), null), "aim", "main", 10, person.chatAccounts);
    addContact(sanitize.nonemptystring(getRow("_Skype"), null), "skype", "main", 10, person.chatAccounts);
    addContact(sanitize.nonemptystring(getRow("_QQ"), null), "qq", "main", 10, person.chatAccounts);

    // Street addresses
    function addStreetAddress(street: string, street2: string, postalCode: string, city: string, state: string, country: string, purpose: string, preference: number) {
      if (!(street || street2 || postalCode || city || state || country)) {
        return;
      }
      let address = new StreetAddress();
      address.street = street;
      address.instructions = street2;
      address.city = city;
      address.postalCode = postalCode;
      address.state = state;
      address.country = country;
      addContact(address.toString(), "address", purpose, preference, person.streetAddresses);
    }
    addStreetAddress(
      getRow("WorkAddress"), getRow("WorkAddress2"),
      getRow("WorkZipCode"), getRow("WorkCity"),
      getRow("WorkState"), getRow("WorkCountry"),
      "work", 1);
    addStreetAddress(
      getRow("HomeAddress"), getRow("HomeAddress2"),
      getRow("HomeZipCode"), getRow("HomeCity"),
      getRow("HomeState"), getRow("HomeCountry"),
      "home", 2);

    // Birthday
    let birthYear = sanitize.integer(getRow("BirthYear"), null);
    let birthMonth = sanitize.integer(getRow("BirthMonth"), null);
    let birthDay = sanitize.integer(getRow("BirthDay"), null);
    if (birthYear || birthMonth || birthDay) {
      let date = new Date();
      date.setUTCFullYear(birthYear);
      date.setUTCMonth(birthMonth);
      date.setUTCDate(birthDay);
      let birthStr = date.toLocaleDateString(undefined, {
        year: birthYear ? 'numeric' : undefined,
        month: birthMonth ? 'long' : undefined,
        day: birthDay ? 'numeric' : undefined,
      });
      addContact(birthStr, "date-locale", "birthday", 0, person.custom);
      addContact(`${birthYear || ""}-${birthMonth || ""}-${birthDay || ""}`, "date-iso", "birthday", 1, person.custom);
    }

    // Additional fields
    addContact(sanitize.nonemptystring(getRow("NickName"), null), "name", "nick", 0, person.custom);
    addContact(sanitize.nonemptystring(getRow("Custom1"), null), "other", "1", 1, person.custom);
    addContact(sanitize.nonemptystring(getRow("Custom2"), null), "other", "2", 2, person.custom);
    addContact(sanitize.nonemptystring(getRow("Custom3"), null), "other", "3", 3, person.custom);
    addContact(sanitize.nonemptystring(getRow("Custom4"), null), "other", "4", 4, person.custom);

    return person;
  }

  static async readAll(profile: ThunderbirdProfile,
    abErrorCallback: (ex: Error) => void,
    entryErrorCallback: (ex: Error) => void):
    Promise<ArrayColl<ThunderbirdAddressbook>> {
    let addressbooks = new ArrayColl<ThunderbirdAddressbook>();
    try {
      await profile.readPrefs();
    } catch (ex) {
      console.log(ex);
      return addressbooks;
    }
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
    return await getSQLiteDatabase(filePath, { readonly: true, timeout: 200 });
  }
}
