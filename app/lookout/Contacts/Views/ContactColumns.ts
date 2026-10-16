import type { Contact } from "../../../logic/Abstract/Contact";
import { Person } from "../../../logic/Abstract/Person";
import { StreetAddress } from "../../../logic/Contacts/StreetAddress";
import { ContactSlots } from "../Form/ContactSlots";
import { PreferredEntry } from "../PreferredEntry";
import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
import { gt } from "../../../l10n/l10n";

export enum ContactColumn {
  FullName = "fullName",
  JobTitle = "jobTitle",
  Company = "company",
  Department = "department",
  EMail = "email",
  BusinessPhone = "businessPhone",
  BusinessFax = "businessFax",
  HomePhone = "homePhone",
  MobilePhone = "mobilePhone",
  BusinessAddress = "businessAddress",
}

export enum ContactView {
  People = "people",
  BusinessCard = "business-card",
  Card = "card",
  Phone = "phone",
  List = "list",
}

export interface ContactSort {
  column: ContactColumn;
  ascending: boolean;
}

export class ContactColumns {
  static readonly view = getLocalStorage<ContactView>("lookout.contacts.view", ContactView.People);
  static readonly sort = getLocalStorage<ContactSort>("lookout.contacts.sort", { column: ContactColumn.FullName, ascending: true });
  static readonly folderPane = getLocalStorage<boolean>("lookout.contacts.folderPane", true);
  static readonly readingPane = getLocalStorage<boolean>("lookout.contacts.readingPane", true);

  static columnsOf(view: ContactView): ContactColumn[] {
    if (view == ContactView.Phone) {
      return [
        ContactColumn.FullName, ContactColumn.Company, ContactColumn.BusinessPhone, ContactColumn.BusinessFax,
        ContactColumn.HomePhone, ContactColumn.MobilePhone,
      ];
    }
    return [
      ContactColumn.FullName, ContactColumn.JobTitle, ContactColumn.Company, ContactColumn.EMail,
      ContactColumn.BusinessPhone, ContactColumn.MobilePhone,
    ];
  }

  static label(column: ContactColumn): string {
    switch (column) {
    case ContactColumn.FullName:
      return gt`Full Name`;
    case ContactColumn.JobTitle:
      return gt`Job Title`;
    case ContactColumn.Company:
      return gt`Company`;
    case ContactColumn.Department:
      return gt`Department`;
    case ContactColumn.EMail:
      return gt`E-mail`;
    case ContactColumn.BusinessPhone:
      return gt`Business Phone`;
    case ContactColumn.BusinessFax:
      return gt`Business Fax`;
    case ContactColumn.HomePhone:
      return gt`Home Phone`;
    case ContactColumn.MobilePhone:
      return gt`Mobile Phone`;
    case ContactColumn.BusinessAddress:
      return gt`Business Address`;
    }
  }

  static width(column: ContactColumn): string {
    switch (column) {
    case ContactColumn.FullName:
      return "minmax(180px, 1.6fr)";
    case ContactColumn.EMail:
      return "minmax(160px, 1.6fr)";
    case ContactColumn.JobTitle:
    case ContactColumn.Company:
    case ContactColumn.Department:
      return "minmax(100px, 1.2fr)";
    default:
      return "minmax(110px, 1fr)";
    }
  }

  static value(column: ContactColumn, contact: Contact): string {
    if (column == ContactColumn.FullName) {
      return contact.name ?? "";
    }
    if (!(contact instanceof Person)) {
      return column == ContactColumn.JobTitle ? gt`Contact group` : "";
    }
    switch (column) {
    case ContactColumn.JobTitle:
      return contact.position ?? "";
    case ContactColumn.Company:
      return contact.company ?? "";
    case ContactColumn.Department:
      return contact.department ?? "";
    case ContactColumn.EMail:
      return PreferredEntry.valueOf(contact.emailAddresses) ?? "";
    case ContactColumn.BusinessPhone:
      return ContactSlots.phoneSlot("business").valueIn(contact.phoneNumbers);
    case ContactColumn.BusinessFax:
      return ContactSlots.phoneSlot("business-fax").valueIn(contact.phoneNumbers);
    case ContactColumn.HomePhone:
      return ContactSlots.phoneSlot("home").valueIn(contact.phoneNumbers);
    case ContactColumn.MobilePhone:
      return ContactSlots.phoneSlot("mobile").valueIn(contact.phoneNumbers);
    case ContactColumn.BusinessAddress:
      return ContactColumns.addressText(ContactSlots.addressSlots[0].valueIn(contact.streetAddresses));
    }
    return "";
  }

  static businessCardLines(person: Person): string[] {
    const kPhones = [
      { column: ContactColumn.BusinessPhone, label: gt`Work` },
      { column: ContactColumn.MobilePhone, label: gt`Mobile` },
      { column: ContactColumn.HomePhone, label: gt`Home` },
    ];
    let lines = kPhones
      .map(phone => ({ value: ContactColumns.value(phone.column, person), label: phone.label }))
      .filter(phone => phone.value)
      .map(phone => `${phone.value} ${phone.label}`);
    let email = ContactColumns.value(ContactColumn.EMail, person);
    if (email) {
      lines.push(email);
    }
    let address = ContactColumns.value(ContactColumn.BusinessAddress, person);
    if (address) {
      lines.push(...address.split("\n"));
    }
    return lines;
  }

  static addressCardFields(person: Person): { label: string, value: string }[] {
    const kFields = [
      { column: ContactColumn.Company, label: gt`Company:` },
      { column: ContactColumn.JobTitle, label: gt`Job Title:` },
      { column: ContactColumn.BusinessPhone, label: gt`Business:` },
      { column: ContactColumn.HomePhone, label: gt`Home:` },
      { column: ContactColumn.MobilePhone, label: gt`Mobile:` },
      { column: ContactColumn.BusinessFax, label: gt`Business Fax:` },
      { column: ContactColumn.EMail, label: gt`E-mail:` },
      { column: ContactColumn.BusinessAddress, label: gt`Business Address:` },
    ];
    return kFields
      .map(field => ({ label: field.label, value: ContactColumns.value(field.column, person) }))
      .filter(field => field.value);
  }

  static addressText(value: string): string {
    if (!value) {
      return "";
    }
    try {
      return new StreetAddress(value).toPlaintext();
    } catch (ex) {
      return value;
    }
  }

  static compare(sort: ContactSort): (a: Contact, b: Contact) => number {
    let direction = sort.ascending ? 1 : -1;
    return (a, b) => {
      let first = ContactColumns.value(sort.column, a);
      let second = ContactColumns.value(sort.column, b);
      if (!first != !second) {
        return first ? -1 : 1;
      }
      return direction * first.localeCompare(second, undefined, { sensitivity: "base", numeric: true }) ||
        (a.name ?? "").localeCompare(b.name ?? "");
    };
  }

  static toggledSort(sort: ContactSort, column: ContactColumn): ContactSort {
    return sort.column == column
      ? { column, ascending: !sort.ascending }
      : { column, ascending: true };
  }
}
