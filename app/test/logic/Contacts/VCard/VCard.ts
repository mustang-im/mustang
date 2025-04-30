import ICalParser from "../../../../logic/Calendar/ICal/ICalParser";
import type { ICalEntry } from "../../../../logic/Calendar/ICal/ICalParser";
import type { Person } from "../../../../logic/Abstract/Person";
import { ContactEntry } from "../../../../logic/Abstract/Person";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";

export default {
  parse(text: string): ICalParser {
    return new ICalParser(text);
  },

  updatePerson(card: ICalParser, person: Person) {
    if (!card.containers.vcard) {
      throw new Error("No vCard found");
    }
    let vcard = card.containers.vcard[0];
    if (vcard.entries.fn) {
      person.name = vcard.entries.fn[0].value;
    }
    if (vcard.entries.photo) {
      let photo = vcard.entries.photo[0];
      if (/^b$/i.test(photo.properties.encoding)) { // vCard 3.0
        person.picture = "data:image/" + photo.properties.type?.toLowerCase() + ";base64," + photo.value;
      } else { // vCard 3.0 or 4.0
        person.picture = photo.value;
      }
    }
    if (vcard.entries.n) {
      person.lastName = vcard.entries.n[0].values[0];
      person.firstName = vcard.entries.n[0].values[1];
    }
    if (vcard.entries.email) {
      for (let entry of vcard.entries.email) {
        person.emailAddresses.add(makeContactEntry(entry, "mailto", false));
      }
    }
    if (vcard.entries.tel) {
      for (let entry of vcard.entries.tel) {
        person.phoneNumbers.add(makeContactEntry(entry, "tel", entry.properties.value == "uri", true));
      }
    }
    if (vcard.entries.impp) {
      for (let entry of vcard.entries.impp) {
        person.chatAccounts.add(makeContactEntry(entry));
      }
    }
    if (vcard.entries.url) {
      for (let entry of vcard.entries.url) {
        person.urls.add(makeContactEntry(entry));
      }
    }
    if (vcard.entries.adr) {
      for (let entry of vcard.entries.adr) {
        // If provided, fold PO Box and Suite into street address
        entry.values.unshift(entry.values.splice(0, 3).filter(Boolean).join(", "));
        // Mustang has to be different...
        entry.value = [0, 1, 3, 2, 4].map(index => entry.values[index] || "").join("\n");
        person.streetAddresses.add(makeContactEntry(entry));
      }
    }
    if (vcard.entries.note) {
      person.notes = vcard.entries.note[0].value;
    }
    if (vcard.entries.org) {
      person.company = vcard.entries.org[0].values[0];
      person.department = vcard.entries.org[0].values[1];
    }
    if (vcard.entries.title) {
      person.position = vcard.entries.title[0].values[0];
    } else if (vcard.entries.role) {
      person.position = vcard.entries.role[0].values[0];
    }
    for (let i = 1; vcard.entries["x-custom" + i]; i++) {
      person.custom.add(new ContactEntry(vcard.entries["x-custom" + i][0].value));
    }
  },
};

function makeContactEntry(entry: ICalEntry, protocol?: string, isURI = true, stripProtocol = false) {
  let value = entry.value;
  if (isURI && /^(\w+):/.test(value)) {
    protocol = RegExp.$1.toLowerCase();
    if (stripProtocol) {
      value = value.slice(protocol.length + 1);
    }
  }
  // An entry's type property can contain multiple tokens; in particular
  // vCard 3.0 supports the token pref for the preferred entry,
  // which is superseded by the pref property in vCard 4.0.
  return new ContactEntry(
    value,
    /work/i.test(entry.properties.type) ? "work" : /home/i.test(entry.properties.type) ? "home" : "other",
    protocol,
    sanitize.integer(entry.properties.pref, +/pref/i.test(entry.properties.type)));
}
