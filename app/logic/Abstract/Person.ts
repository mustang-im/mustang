import { ContactBase } from './Contact';
import { notifyChangedProperty, Observable } from '../util/Observable';
import { ArrayColl } from 'svelte-collections';

export class Person extends ContactBase {
  @notifyChangedProperty
  firstName: string | null;
  @notifyChangedProperty
  lastName: string | null;
  readonly emailAddresses = new ArrayColl<ContactEntry>();
  readonly phoneNumbers = new ArrayColl<ContactEntry>();
  readonly chatAccounts = new ArrayColl<ContactEntry>();
  readonly groups = new ArrayColl<ContactEntry>();
  readonly streetAddresses = new ArrayColl<ContactEntry>();
  @notifyChangedProperty
  notes: string | null = "";

  @notifyChangedProperty
  company: string;
  @notifyChangedProperty
  department: string;
  @notifyChangedProperty
  position: string;

  async save() {
    await super.save();
    await this.addressbook.storage.savePerson(this);
  }

  toString() {
    return this.name;
  }

  notifyObservers(propertyName?: string, oldValue?: any): void {
    if (propertyName == "name" && this.name && typeof (this.name) == "string") {
      let sp = this.name?.split(" ");
      if (!this.lastName || !this.firstName) {
        // Last word is last name, rest is first name
        if (sp.length > 1) {
          this.lastName = sp.pop();
          this.firstName = sp.join(" ");
        }
      } else {
        let lastNameStart = this.name.indexOf(" " + this.lastName);
        if (lastNameStart >= 0) { // editing first name
          this.lastName = this.name.substring(lastNameStart + 1).trim();
          this.firstName = this.name.substring(0, lastNameStart).trim();
        } else { // editing last name
          if (this.firstName == this.name.substring(0, this.firstName.length)) {
            this.lastName = this.name.substring(this.firstName.length + 1).trim();
          } else {
            this.firstName = "";
            this.lastName = "";
          }
        }
      }
    }
    super.notifyObservers(propertyName, oldValue);
  }
}

export class ContactEntry extends Observable {
  @notifyChangedProperty
  value: string; // email address, or phone number etc.
  @notifyChangedProperty
  protocol: string | null; // "email", "tel", "fax", "matrix", "xmpp" etc.
  @notifyChangedProperty
  purpose: string | null; // "work", "home", "mobile", "other", "Teams", "WhatsApp", or any other text
  /** Lower is more preferred */
  @notifyChangedProperty
  preference = 0;

  constructor(value: string, purpose: string | null = null) {
    super();
    this.value = value;
    this.purpose = purpose;
  }
}
