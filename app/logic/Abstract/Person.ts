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
  /** Webpages about the person */
  readonly urls = new ArrayColl<ContactEntry>();
  /** Custom user-defined fields */
  readonly custom = new ArrayColl<ContactEntry>();
  @notifyChangedProperty
  notes: string | null = "";

  @notifyChangedProperty
  company: string;
  @notifyChangedProperty
  department: string;
  @notifyChangedProperty
  position: string;

  /** How often this person has been contacted recently.
   * A combination of frequency and recency.
   * Higher is more popular. */
  @notifyChangedProperty
  popularity: number = 0;

  /**
   * Saves the contact locally to the database.
    */
  async save() {
    await super.save();
    await this.addressbook.storage.savePerson(this);
  }

  async saveToServer(): Promise<void> {
    // nothing to do for local persons
  }

  /**
   * Deletes the contact locally from the database.
    */
  async deleteIt() {
    if (!this.addressbook) {
      return;
    }
    this.addressbook.persons.remove(this);
    if (this.dbID) {
      await this.addressbook.storage.deletePerson(this);
    }
  }

  async deleteFromServer(): Promise<void> {
    // nothing to do for local persons
  }

  toString() {
    return this.name;
  }

  notifyObservers(propertyName?: string, oldValue?: any): void {
    if (propertyName == "name" && this.name && typeof (this.name) == "string") {
      this.fixName();
    }
    super.notifyObservers(propertyName, oldValue);
  }

  protected fixName(): void {
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

  async merge(other: Person) {
    this.picture = this.picture ?? other.picture;
    this.company = this.company ?? other.company;
    this.department = this.department ?? other.department;
    this.position = this.position ?? other.position;
    this.notes = ((this.notes || "") + (other.notes || "")) || null;
    this.emailAddresses.addAll(other.emailAddresses);
    this.phoneNumbers.addAll(other.phoneNumbers);
    this.chatAccounts.addAll(other.chatAccounts);
    this.streetAddresses.addAll(other.streetAddresses);
    this.urls.addAll(other.urls);
    this.groups.addAll(other.groups);
    await other.deleteIt();
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

  constructor(value: string, purpose: string | null = null, protocol: string | null = null) {
    super();
    this.value = value;
    this.purpose = purpose;
    this.protocol = protocol;
  }
}
