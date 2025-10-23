import { Person, ContactEntry } from '../../Abstract/Person';
import type { JMAPAddressbook } from './JMAPAddressbook';
import type { TJSContact, TPrivateOrWork } from './JSContactTypes';
import type { StreetAddress } from '../StreetAddress';
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ensureArray } from '../../util/util';

export class JMAPPerson extends Person {
  declare addressbook: JMAPAddressbook | null;

  get uid() {
    return this.id;
  }
  set uid(val) {
    this.id = val;
  }
  get account() {
    return this.addressbook.account;
  }

  fromJMAP(jmap: TJSContact) {
    this.uid = sanitize.nonemptystring(jmap.uid);
    this.name = sanitize.nonemptystring(jmap.name.full, "");
    if (!jmap.name.full && jmap.name.components) {
      let nameConcat = ensureArray(jmap.name.components)
        .map(c => sanitize.string(c.value))
        .join(sanitize.string(jmap.name.defaultSeparator));
      this.name = sanitize.nonemptystring(nameConcat, "");
    }
    this.firstName = sanitize.nonemptystring(jmap.name.components.find(c => c.kind == "given").value, "");
    this.lastName = sanitize.nonemptystring(jmap.name.components.find(c => c.kind == "surname").value, "");

    this.emailAddresses.replaceAll(Object.values(jmap.emails).map(e => new ContactEntry(
      sanitize.emailAddress(e.address),
      JMAPPerson.contextToHome(e.contexts),
      "mailto",
      sanitize.integerRange(e.pref, 0, 100))));
    this.phoneNumbers.replaceAll(Object.values(jmap.phones).map(p => new ContactEntry(
      sanitize.nonemptystring(p.number),
      JMAPPerson.contextToHome(p.contexts),
      JMAPPerson.phoneFeature(p.features),
      sanitize.integerRange(p.pref, 0, 100))));
    this.chatAccounts.replaceAll(Object.values(jmap.onlineServices).map(o => new ContactEntry(
      sanitize.nonemptystring(o.uri, sanitize.nonemptystring(o.user)),
      JMAPPerson.contextToHome(o.contexts),
      o.service,
      sanitize.integerRange(o.pref, 0, 100))));
    //this.streetAddresses.replaceAll(Object.values(jmap.addresses).map(a => new ContactEntry(

    this.notes = sanitize.nonemptystring(Object.values(jmap.notes)[0]?.note, "");
    this.company = sanitize.nonemptystring(Object.values(jmap.organizations)[0]?.name, "");
    this.department = sanitize.nonemptystring(Object.values(Object.values(jmap.organizations)[0]?.units)[0]?.name, "");
    this.position = sanitize.nonemptystring(Object.values(jmap.titles)[0]?.name, "");
  }

  protected static contextToHome(contexts: TPrivateOrWork): string | null {
    return contexts?.private
      ? "home"
      : contexts?.work
        ? "work"
        : null;
  }

  protected static phoneFeature(features: Record<"voice" | "mobile" | "main-number" | "fax" | "pager" | "text" | "textphone" | "video", true>): string | null {
    let first = Object.keys(features)[0];
    return first == "voice" ? "tel" : first;
  }


  async saveToServer() {
    await this.account.makeSingleCall("Email/set", {
      accountId: this.account.accountID,
      update: {
        [this.uid]: {
          // TODO, example: [`keywords/${name}`]: set ? true : null,
        },
      },
    });
  }

  async deleteFromServer() {
    await this.account.makeSingleCall("Email/set", {
      accountId: this.account.accountID,
      destroy: [this.uid],
    });
  }
}
