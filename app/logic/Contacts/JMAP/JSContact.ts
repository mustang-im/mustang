import { Person, ContactEntry } from '../../Abstract/Person';
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

    person.emailAddresses.replaceAll(objValues(jscontact.emails).map(e => new ContactEntry(
      sanitize.emailAddress(e.address),
      JSContact.fromContextToPurpose(e.contexts),
      "mailto",
      sanitize.integerRange(e.pref, 0, 100))));
    person.phoneNumbers.replaceAll(objValues(jscontact.phones).map(p => new ContactEntry(
      sanitize.nonemptystring(p.number),
      JSContact.fromContextToPurpose(p.contexts),
      JSContact.fromPhoneFeatureToProtocol(p.features),
      sanitize.integerRange(p.pref, 0, 100))));
    person.chatAccounts.replaceAll(objValues(jscontact.onlineServices).map(o => new ContactEntry(
      sanitize.nonemptystring(o.uri, sanitize.nonemptystring(o.user)),
      JSContact.fromContextToPurpose(o.contexts),
      o.service,
      sanitize.integerRange(o.pref, 0, 100))));
    person.urls.replaceAll(objValues(jscontact.links).map(o => new ContactEntry(
      sanitize.url(o.uri, null, ["https", "http", "mailto", "tel", "fax"]), // ["*"] ?
      new URL(o.uri).protocol,
      undefined,
      sanitize.integerRange(o.pref, 0, 100))));

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
    JSContact.updateContactEntries<TEmailAddress>(jscontact.emails, person.emailAddresses,
      "address", () => {});
    jscontact.phones ??= {};
    JSContact.updateContactEntries<TPhone>(jscontact.phones, person.phoneNumbers,
      "number", (entry: any, personEntry: ContactEntry) => {
        entry.features = JSContact.fromProtocolToPhoneFeature(personEntry.protocol);
      });
    jscontact.onlineServices ??= {};
    JSContact.updateContactEntries<TOnlineService>(jscontact.onlineServices, person.chatAccounts,
      "user", (entry: any, personEntry: ContactEntry) => {
        entry.service = personEntry.protocol;
      });
    jscontact.links ??= {};
    JSContact.updateContactEntries<TLink>(jscontact.links, person.urls,
      "uri", () => { });
    // TODO
    // person.streetAddresses
    // person.popularity

    if (person.picture) {
      jscontact.media ??= {};
      jscontact.media.avatar = {
        uri: person.picture,
        kind: "photo",
      };
    }

    person.notes = sanitize.nonemptystring(objValues(jscontact.notes)[0]?.note, "");
    let company = objValues(jscontact.organizations)[0];
    person.company = sanitize.nonemptystring(company?.name, "");
    person.department = sanitize.nonemptystring(company?.units[0]?.name, "");
    person.position = sanitize.nonemptystring(objValues(jscontact.titles)[0]?.name, "");
  }

  protected static updateContactEntries<T extends { pref?: number, contexts?: Record<string, true> }>(
      jscontactRecords: Record<TID, T>,
      personEntries: ArrayColl<ContactEntry>,
      valueProp: string,
      otherPropsFunc: (entry: any, personEntry: ContactEntry) => void
    ) {
    let jscontactArray = objValues(jscontactRecords);
    for (let personEntry of personEntries) {
      let entry = jscontactArray.find(entry => entry[valueProp] == personEntry.value);
      if (!entry) {
        entry = {} as T;
        jscontactRecords[crypto.randomUUID()] = entry;
      }
      entry[valueProp] = personEntry.value;
      entry.pref = personEntry.preference;
      entry.contexts = JSContact.fromPurposeToContext(personEntry.purpose);
      otherPropsFunc(entry, personEntry);
    }
  }
}

function objValues<TValue>(obj: Record<string, TValue>): TValue[] {
  if (!obj) {
    return [];
  }
  return Object.values(obj);
}
