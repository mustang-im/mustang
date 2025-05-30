import ICalParser from "../../Calendar/ICal/ICalParser";
import type { ICalEntry } from "../../Calendar/ICal/ICalParser";
import type { Person } from "../../Abstract/Person";
import { ContactEntry } from "../../Abstract/Person";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { ArrayColl } from 'svelte-collections';

export function convertVCardToPerson(vCard: string, person: Person) {
  let parsed = new ICalParser(vCard);
  updatePerson(parsed, person);
}

export function parse(text: string): ICalParser {
  return new ICalParser(text);
}

export function updatePerson(card: ICalParser, person: Person) {
  if (!card.containers.vcard) {
    throw new Error("No vCard found");
  }
  let vcard = card.containers.vcard[0];
  person.name = vcard.entries.fn?.[0].value ?? "";
  if (vcard.entries.photo) {
    let photo = vcard.entries.photo[0];
    if (/^b$/i.test(photo.properties.encoding)) { // vCard 3.0
      person.picture = "data:image/" + photo.properties.type?.toLowerCase() + ";base64," + photo.value;
    } else { // vCard 3.0 or 4.0
      person.picture = photo.value;
    }
  } else {
    person.picture = null;
  }
  person.lastName = vcard.entries.n?.[0].values[0] ?? "";
  person.firstName = vcard.entries.n?.[0].values[1] ?? "";
  person.emailAddresses.clear();
  if (vcard.entries.email) {
    for (let entry of vcard.entries.email) {
      person.emailAddresses.add(makeContactEntry(entry, "mailto", false));
    }
  }
  person.phoneNumbers.clear();
  if (vcard.entries.tel) {
    for (let entry of vcard.entries.tel) {
      person.phoneNumbers.add(makeContactEntry(entry, "tel", entry.properties.value == "uri", true));
    }
  }
  person.chatAccounts.clear();
  if (vcard.entries.impp) {
    for (let entry of vcard.entries.impp) {
      person.chatAccounts.add(makeContactEntry(entry));
    }
  }
  person.urls.clear();
  if (vcard.entries.url) {
    for (let entry of vcard.entries.url) {
      person.urls.add(makeContactEntry(entry));
    }
  }
  person.streetAddresses.clear();
  if (vcard.entries.adr) {
    for (let entry of vcard.entries.adr) {
      // If provided, fold PO Box and Suite into street address
      entry.values.unshift(entry.values.splice(0, 3).filter(Boolean).join(", "));
      // Mustang has to be different...
      entry.value = [0, 1, 3, 2, 4].map(index => entry.values[index] || "").join("\n");
      person.streetAddresses.add(makeContactEntry(entry));
    }
  }
  person.notes = vcard.entries.note?.[0].value ?? "";
  person.company = vcard.entries.org?.[0].values[0] ?? "";
  person.department = vcard.entries.org?.[0].values[1] ?? "";
  if (vcard.entries.title) {
    person.position = vcard.entries.title[0].values[0];
  } else if (vcard.entries.role) {
    person.position = vcard.entries.role[0].values[0];
  } else {
    person.position = "";
  }
  person.custom.clear();
  for (let i = 1; vcard.entries["x-custom" + i]; i++) {
    person.custom.add(new ContactEntry(vcard.entries["x-custom" + i][0].value));
  }
}

export function convertPersonToVCard(person: Person) {
  let card = new ICalParser("BEGIN:VCARD\r\nEND:VCARD\r\n");
  return updateCard(person, card);
}

export function updateCard(person: Person, card: ICalParser): string {
  if (!card.containers.vcard) {
    throw new Error("No vCard found");
  }
  let vcard = card.containers.vcard[0];
  let container: Record<string, string[]> = Object.create(null);
  for (let key in vcard.entries) {
    if (key != "version" && key != "prodid" && !/^x-custom\d+$/.test(key)) {
      container[key] = vcard.entries[key].map(entry => entry.line);
    }
  }
  setValue(container, "fn", person.name ?? "");
  setValue(container, "photo", person.picture ?? "", { value: "uri" });
  setValue(container, "n", [person.lastName, person.firstName, "", "", ""]);
  setValues(container, "email", person.emailAddresses);
  setValues(container, "tel", person.phoneNumbers, { value: "text" });
  setValues(container, "impp", person.chatAccounts);
  setValues(container, "url", person.urls);
  setAdrs(container, person.streetAddresses);
  setValue(container, "note", person.notes ?? "");
  setValue(container, "org", [person.company, person.department]);
  setValue(container, "title", person.position ?? "");
  setValue(container, "role", "");
  for (let i = 0; i < person.custom.length; i++) {
    setValue(container, "x-custom" + (i + 1), person.custom.getIndex(i).value);
  }
  return "BEGIN:VCARD\r\nVERSION:4.0\r\nPRODID:-//Beonex//appName//EN\r\n" + Object.values(container).flat().map(line => line.match(/.{1,75}/gu).join("\r\n ")).join("\r\n") + "\r\nEND:VCARD\r\n";
}

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

function setValue(container: Record<string, string[]>, key: string, value: string | string[] | null, parameters: Record<string, string> = {}) {
  if (Array.isArray(value) ? !value.some(Boolean) : !value) {
    delete container[key];
    return;
  }
  if (typeof value == "string") {
    value = value.split(";");
  }
  let line = key.toUpperCase();
  for (let parameter in parameters) {
    // We control parameters, no need to escape
    line += ";" + parameter.toUpperCase() + "=" + parameters[parameter];
  }
  line += ":";
  line += value.map(value => escaped(value, false)).join(";");
  container[key] = [line];
}

function setValues(container: Record<string, string[]>, key: string, values: ArrayColl<ContactEntry>, parameters: Record<string, string> = {}) {
  container[key] = values.contents.map(entry => {
    let line = key.toUpperCase();
    for (let parameter in parameters) {
      // We control parameters, no need to escape
      line += ";" + parameter.toUpperCase() + "=" + parameters[parameter];
    }
    let type = entry.purpose == "work" || entry.purpose == "home" ? entry.purpose : "";
    if (entry.preference == 1) {
      type = type ? type + ",pref" : "pref";
    }
    if (type) {
      line += ";TYPE=" + type.toUpperCase();
    }
    if (entry.preference) {
      line += `;PREF=${entry.preference}`;
    }
    line += ":";
    line += entry.value.split(";").map(value => escaped(value, false)).join(";");
    return line;
  });
}

function setAdrs(container: Record<string, string[]>, values: ArrayColl<ContactEntry>) {
  container.adr = values.contents.map(entry => {
    let line = "ADR";
    let type = entry.purpose == "work" || entry.purpose == "home" ? entry.purpose : "";
    if (entry.preference == 1) {
      type = type ? type + ",pref" : "pref";
    }
    if (type) {
      line += ";TYPE=" + type.toUpperCase();
    }
    if (entry.preference) {
      line += `;PREF=${entry.preference}`;
    }
    line += ":";
    let values = `\n\n${entry.value}`.split("\n");
    // Mustang has to be different...
    values = [0, 1, 2, 3, 5, 4, 6].map(index => values[index] ?? "");
    line += values.map(value => escaped(value, false)).join(";");
    return line;
  });
}

function escaped(s: string, quote: boolean): string {
  if (!s) {
    return "";
  }
  if (quote) {
    // param-value isn't supposed to include these at all;
    // maybe we should just delete them?
    s = s.replace(/["\\]/g, "\\$&").replace(/\r\n?|\n/g, "\\n");
    if (/[\\:;,]/.test(s)) {
      s = `"${s}"`;
    }
  } else {
    s = s.replace(/[\\;,]/g, "\\$&").replace(/\r\n?|\n/g, "\\n");
  }
  return s;
}
