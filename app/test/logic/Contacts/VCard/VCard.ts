import ICalParser from "../../../../logic/Calendar/ICal/ICalParser";
import type { Person } from "../../../../logic/Abstract/Person";

export default {
  parse(text: string): ICalParser {
    return new ICalParser(text);
  },

  updatePerson(card: ICalParser, person: Person) {
    if (!card.containers.vcard) {
      throw new Error("No vCard found");
    }
    let vcard = card.containers.vcard[0];
    if (vcard.entries.note) {
      person.notes = vcard.entries.note[0].value;
    }
    if (vcard.entries.org) {
      person.company = vcard.entries.org[0].values[0];
      person.department = vcard.entries.org[0].values[1];
    }
    if (vcard.entries.title) {
      person.position = vcard.entries.title[0].values[0];
    }
  },
};
