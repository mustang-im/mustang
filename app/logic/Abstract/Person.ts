import { ContactBase } from './Contact';
import { notifyChangedProperty } from '../util/Observable';
import { ArrayColl } from 'svelte-collections';

export class Person extends ContactBase {
  dbID: number;
  @notifyChangedProperty
  firstName: string;
  @notifyChangedProperty
  lastName: string;
  readonly emailAddresses = new ArrayColl<ContactEntry>();
  readonly phoneNumbers = new ArrayColl<ContactEntry>();
  readonly chatAccounts = new ArrayColl<ContactEntry>();
  readonly groups = new ArrayColl<ContactEntry>();
  readonly streetAddresses = new ArrayColl<ContactEntry>();
  @notifyChangedProperty
  notes = "";

  @notifyChangedProperty
  company: string;
  @notifyChangedProperty
  department: string;
  @notifyChangedProperty
  position: string;

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

export class ContactEntry {
  purpose: string; // "work", "home", "mobile", "other", "Teams", "WhatsApp", or any other text
  value: string; // email address, or phone number etc.
  preferred = false;

  constructor(value: string, purpose: string) {
    this.value = value;
    this.purpose = purpose;
  }
}
