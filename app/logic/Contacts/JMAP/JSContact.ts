import { type Person, ContactEntry } from '../../Abstract/Person';
import type { TEmailAddress, TJSContact, TLink, TNameComponent, TOnlineService, TPhone, TPhoneFeature, TPrivateOrWork } from './TJSContact';
import type { JMAPPerson } from './JMAPPerson';
import type { TID } from '../../Mail/JMAP/TJMAPGeneric';
import { sanitize } from '../../../../lib/util/sanitizeDatatypes';
import { ensureArray } from '../../util/util';
import type { ArrayColl } from 'svelte-collections';

export class JSContact {
  static toPerson(jscontact: TJSContact, person: Person) {
    (person as JMAPPerson).uid = sanitize.nonemptystring(jscontact.uid, person.id);
    person.name = sanitize.nonemptystring(jscontact.name?.full, "");
    if (!jscontact.name?.full && jscontact.name?.components) {
      let nameConcat = ensureArray(jscontact.name?.components)
        .map(c => sanitize.string(c.value))
        .join(sanitize.string(jscontact.name?.defaultSeparator));
      person.name = sanitize.nonemptystring(nameConcat, "");
    }
    person.firstName = sanitize.nonemptystring(jscontact.name?.components?.find(c => c.kind == "given")?.value, "");
    person.lastName = sanitize.nonemptystring(jscontact.name?.components?.find(c => c.kind == "surname")?.value, "");

    JSContact.toContactEntries(person.emailAddresses, jscontact.emails, e => new ContactEntry(
      sanitize.emailAddress(e.address),
      "mailto"));
    JSContact.toContactEntries(person.phoneNumbers, jscontact.phones, e => new ContactEntry(
      sanitize.nonemptystring(e.number),
      JSContact.fromPhoneFeatureToProtocol(e.features)));
    JSContact.toContactEntries(person.chatAccounts, jscontact.onlineServices, e => new ContactEntry(
      sanitize.nonemptystring(e.uri, sanitize.nonemptystring(e.user)),
      e.service));
    JSContact.toContactEntries(person.urls, jscontact.links, e => new ContactEntry(
      sanitize.url(e.uri, null, ["https", "http", "mailto", "tel", "fax"]), // ["*"] ?
      new URL(e.uri).protocol));

    person.picture = sanitize.url(jscontact.media?.avatar?.uri, null, ["https", "data", "blob"]);

    person.notes = sanitize.nonemptystring(objValues(jscontact.notes)[0]?.note, "");
    let company = objValues(jscontact.organizations)[0];
    person.company = sanitize.nonemptystring(company?.name, "");
    person.department = sanitize.nonemptystring(company?.units[0]?.name, "");
    person.position = sanitize.nonemptystring(objValues(jscontact.titles)[0]?.name, "");
  }

  protected static fromContextToPurpose(contexts: Record<string, true>): string | null {
    return contexts?.private
      ? "home"
      : contexts?.work
        ? "work"
        : Object.keys(contexts)[0];
  }

  protected static fromPurposeToContext(purpose: string): Record<string, true> {
    return purpose == "home"
      ? { private: true }
      : purpose == "work"
        ? { work: true }
        : { [purpose]: true };
  }

  protected static fromPhoneFeatureToProtocol(features: TPhoneFeature): string | null {
    let first = Object.keys(features)[0];
    return first == "voice" ? "tel" : first;
  }

  protected static fromProtocolToPhoneFeature(protocol: string): TPhoneFeature {
    let features = {} as TPhoneFeature;
    if (protocol == "tel") {
      features.voice = true;
    } else if (["mobile", "main-number", "fax", "pager", "text", "textphone", "video"].includes(protocol)) {
      features[protocol] = true;
    } else { // fallback for unsupported protocol
      features.voice = true;
    }
    return features;
  }

  /** Updates `jscontact` with the properties from `person`,
   * leaving any unsupported properties in jscontact as-is. */
  static fromPerson(person: Person, jscontact: TJSContact) {
    jscontact.uid = (person as JMAPPerson).uid ?? person.id;
    jscontact.name ??= {};
    jscontact.name.full = person.name;
    if (person.firstName || person.lastName) {
      jscontact.name.components ??= [];
      let first = jscontact.name.components.find(c => c.kind == "given");
      let last = jscontact.name.components.find(c => c.kind == "surname");
      if (!first) {
        first = {
          kind: "given",
        } as TNameComponent;
        jscontact.name.components.unshift(first);
      }
      if (!last) {
        last = {
          kind: "surname",
        } as TNameComponent;
        jscontact.name.components.push(last);
      }
      first.value = person.firstName;
      last.value = person.lastName;
    }

    jscontact.emails ??= {};
    jscontact.phones ??= {};
    jscontact.onlineServices ??= {};
    jscontact.links ??= {};
    JSContact.fromContactEntries<TEmailAddress>(jscontact.emails, person.emailAddresses, "address",
      () => {});
    JSContact.fromContactEntries<TPhone>(jscontact.phones, person.phoneNumbers, "number",
      (entry: any, personEntry: ContactEntry) => {
        entry.features = JSContact.fromProtocolToPhoneFeature(personEntry.protocol);
      });
    JSContact.fromContactEntries<TOnlineService>(jscontact.onlineServices, person.chatAccounts, "user",
      (entry: any, personEntry: ContactEntry) => {
        entry.service = personEntry.protocol;
      });
    JSContact.fromContactEntries<TLink>(jscontact.links, person.urls, "uri",
      () => {});
    // TODO
    // person.streetAddresses
    // person.popularity

    if (person.picture) {
      jscontact.media ??= {};
      jscontact.media.avatar = {
        uri: person.picture,
        kind: "photo",
      };
    } else {
      delete jscontact.media?.avatar;
    }

    // TODO Save notes, position, company
  }

  protected static toContactEntries<T extends { pref?: number, contexts?: Record<string, true> }>(
    personEntriesAbstract: ArrayColl<ContactEntry>,
    jscontactEntries: Record<TID, T>,
    getValues: (e: T) => ContactEntry,
  ) {
    let personEntries = personEntriesAbstract as ArrayColl<ContactEntry>;
    for (let jmapID in jscontactEntries) {
      let jscontactEntry = jscontactEntries[jmapID];
      let newCE = getValues(jscontactEntry);
      newCE.purpose = JSContact.fromContextToPurpose(jscontactEntry.contexts);
      newCE.preference = sanitize.integerRange(jscontactEntry.pref, 0, 100);
      let existing = personEntries.find(p => getJMAPID(p) == jmapID);
      if (existing) {
        existing.value = newCE.value;
        existing.protocol = newCE.protocol;
        existing.purpose = newCE.purpose;
        existing.preference = newCE.preference;
      } else {
        setJMAPID(newCE, sanitize.alphanumdash(jmapID));
        personEntries.add(newCE);
      }
    }
    // Delete old entries
    for (let p of personEntries) {
      let jmapID = getJMAPID(p);
      if (!jmapID || !jscontactEntries[jmapID]) {
        personEntries.remove(p);
      }
    }
  }

  protected static fromContactEntries<T extends { pref?: number, contexts?: Record<string, true> }>(
      jscontactEntries: Record<TID, T>,
      personEntriesAbstract: ArrayColl<ContactEntry>,
      valueProp: string,
      otherPropsFunc: (entry: any, personEntry: ContactEntry) => void
    ) {
    let personEntries = personEntriesAbstract as ArrayColl<ContactEntry>;
    for (let personEntry of personEntries) {
      let jmapID = getJMAPID(personEntry);
      if (!jmapID) {
        jmapID = crypto.randomUUID();
        setJMAPID(personEntry, jmapID);
      }
      let jscontactEntry = jscontactEntries[jmapID] ??= {} as T;
      jscontactEntry[valueProp] = personEntry.value;
      jscontactEntry.pref = personEntry.preference;
      jscontactEntry.contexts = JSContact.fromPurposeToContext(personEntry.purpose);
      otherPropsFunc(jscontactEntry, personEntry);
    }
    // Delete old entries
    for (let jmapID in jscontactEntries) {
      if (personEntries.find(p => getJMAPID(p) == jmapID)) {
        continue;
      }
      delete jscontactEntries[jmapID];
    }
  }
}

function objValues<TValue>(obj: Record<string, TValue>): TValue[] {
  if (!obj) {
    return [];
  }
  return Object.values(obj);
}

/** The right solution would be a `JMAPContactEntry` subclass, but then we would need to
 * adapt *all* places that create `new ContactEntry` to do `person.newContactEntry()`. */
function getJMAPID(contactEntry: ContactEntry): TID {
  return contactEntry.json?.jmapID;
}
function setJMAPID(contactEntry: ContactEntry, jmapID: TID) {
  contactEntry.json ??= {} as any;
  contactEntry.json.jmapID = jmapID;
}
