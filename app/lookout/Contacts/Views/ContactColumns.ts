import type { Contact } from "../../../logic/Abstract/Contact";
import { Person } from "../../../logic/Abstract/Person";
import { StreetAddress } from "../../../logic/Contacts/StreetAddress";
import { ContactSlots } from "../Form/ContactSlots";
import { PreferredEntry } from "../PreferredEntry";
import { ColumnOrder } from "../../Calendar/ViewSettings/ColumnOrder";
import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
import { gt } from "../../../l10n/l10n";

export enum ContactColumn {
  FullName = "fullName",
  FirstName = "firstName",
  LastName = "lastName",
  JobTitle = "jobTitle",
  Company = "company",
  Department = "department",
  EMail = "email",
  EMail2 = "email2",
  EMail3 = "email3",
  BusinessPhone = "businessPhone",
  BusinessPhone2 = "businessPhone2",
  BusinessFax = "businessFax",
  HomePhone = "homePhone",
  HomePhone2 = "homePhone2",
  HomeFax = "homeFax",
  MobilePhone = "mobilePhone",
  OtherPhone = "otherPhone",
  OtherFax = "otherFax",
  BusinessAddress = "businessAddress",
  BusinessStreet = "businessStreet",
  BusinessCity = "businessCity",
  BusinessState = "businessState",
  BusinessPostalCode = "businessPostalCode",
  BusinessCountry = "businessCountry",
  HomeAddress = "homeAddress",
  HomeStreet = "homeStreet",
  HomeCity = "homeCity",
  HomeState = "homeState",
  HomePostalCode = "homePostalCode",
  HomeCountry = "homeCountry",
  OtherAddress = "otherAddress",
  WebPage = "webPage",
  IMAddress = "imAddress",
  Notes = "notes",
  InFolder = "inFolder",
}

export enum ContactView {
  People = "people",
  BusinessCard = "business-card",
  Card = "card",
  Phone = "phone",
  List = "list",
}

type AddressPart = "street" | "city" | "state" | "postalCode" | "country";

export interface ContactSort {
  column: ContactColumn;
  ascending: boolean;
}

export class ContactColumns {
  static readonly view = getLocalStorage<ContactView>("lookout.contacts.view", ContactView.People);
  static readonly sort = getLocalStorage<ContactSort>("lookout.contacts.sort", { column: ContactColumn.FullName, ascending: true });
  static readonly folderPane = getLocalStorage<boolean>("lookout.contacts.folderPane", true);
  static readonly readingPane = getLocalStorage<boolean>("lookout.contacts.readingPane", true);

  static readonly listColumns = getLocalStorage<ContactColumn[]>("lookout.contacts.list.columns",
    ContactColumns.defaultColumns(ContactView.List));
  static readonly phoneColumns = getLocalStorage<ContactColumn[]>("lookout.contacts.phone.columns",
    ContactColumns.defaultColumns(ContactView.Phone));

  static readonly listGroupBy = getLocalStorage<ContactSort | null>("lookout.contacts.list.groupBy",
    ContactColumns.defaultGroupBy(ContactView.List));
  static readonly phoneGroupBy = getLocalStorage<ContactSort | null>("lookout.contacts.phone.groupBy",
    ContactColumns.defaultGroupBy(ContactView.Phone));

  static defaultGroupBy(view: ContactView): ContactSort | null {
    return view == ContactView.List ? { column: ContactColumn.Company, ascending: true } : null;
  }

  static groupBySetting(view: ContactView) {
    return view == ContactView.Phone ? ContactColumns.phoneGroupBy : ContactColumns.listGroupBy;
  }

  static defaultColumns(view: ContactView): ContactColumn[] {
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

  static columnsSetting(view: ContactView) {
    return view == ContactView.Phone ? ContactColumns.phoneColumns : ContactColumns.listColumns;
  }

  static shownColumns(stored: ContactColumn[]): ContactColumn[] {
    return new ColumnOrder(stored ?? [], ContactColumns.allColumns, ContactColumn.FullName).columns;
  }

  static setColumns(view: ContactView, columns: ContactColumn[]) {
    ContactColumns.columnsSetting(view).value = ContactColumns.shownColumns(columns);
  }

  static removeColumn(view: ContactView, column: ContactColumn) {
    let order = new ColumnOrder(ContactColumns.columnsSetting(view).value ?? [], ContactColumns.allColumns, ContactColumn.FullName);
    order.remove(column);
    ContactColumns.columnsSetting(view).value = order.columns;
  }

  static moveColumn(view: ContactView, column: ContactColumn, before: ContactColumn | null) {
    let order = new ColumnOrder(ContactColumns.columnsSetting(view).value ?? [], ContactColumns.allColumns, ContactColumn.FullName);
    order.moveBefore(column, before);
    ContactColumns.columnsSetting(view).value = order.columns;
  }

  static get allColumns(): ContactColumn[] {
    return Object.values(ContactColumn);
  }

  static columnSets(): { label: string, columns: ContactColumn[] }[] {
    return [
      {
        label: gt`Frequently-used fields`,
        columns: [
          ContactColumn.FullName, ContactColumn.JobTitle, ContactColumn.Company, ContactColumn.Department,
          ContactColumn.EMail, ContactColumn.BusinessPhone, ContactColumn.BusinessFax, ContactColumn.HomePhone,
          ContactColumn.MobilePhone, ContactColumn.BusinessAddress, ContactColumn.HomeAddress, ContactColumn.InFolder,
        ],
      },
      {
        label: gt`Address fields`,
        columns: [
          ContactColumn.BusinessAddress, ContactColumn.BusinessStreet, ContactColumn.BusinessCity, ContactColumn.BusinessState,
          ContactColumn.BusinessPostalCode, ContactColumn.BusinessCountry,
          ContactColumn.HomeAddress, ContactColumn.HomeStreet, ContactColumn.HomeCity, ContactColumn.HomeState,
          ContactColumn.HomePostalCode, ContactColumn.HomeCountry,
          ContactColumn.OtherAddress,
        ],
      },
      {
        label: gt`E-mail fields`,
        columns: [ ContactColumn.EMail, ContactColumn.EMail2, ContactColumn.EMail3 ],
      },
      {
        label: gt`Fax/Other number fields`,
        columns: [ ContactColumn.BusinessFax, ContactColumn.HomeFax, ContactColumn.OtherFax, ContactColumn.OtherPhone ],
      },
      {
        label: gt`Miscellaneous fields`,
        columns: [ ContactColumn.InFolder, ContactColumn.IMAddress, ContactColumn.Notes, ContactColumn.WebPage ],
      },
      {
        label: gt`Name fields`,
        columns: [ ContactColumn.FullName, ContactColumn.FirstName, ContactColumn.LastName ],
      },
      {
        label: gt`Phone number fields`,
        columns: [
          ContactColumn.BusinessPhone, ContactColumn.BusinessPhone2, ContactColumn.BusinessFax,
          ContactColumn.HomePhone, ContactColumn.HomePhone2, ContactColumn.HomeFax,
          ContactColumn.MobilePhone, ContactColumn.OtherPhone, ContactColumn.OtherFax,
        ],
      },
      {
        label: gt`All Contact fields`,
        columns: [ ...ContactColumns.allColumns ].sort((a, b) => ContactColumns.label(a).localeCompare(ContactColumns.label(b))),
      },
    ];
  }

  static label(column: ContactColumn): string {
    switch (column) {
    case ContactColumn.FullName:
      return gt`Full Name`;
    case ContactColumn.FirstName:
      return gt`First Name`;
    case ContactColumn.LastName:
      return gt`Last Name`;
    case ContactColumn.JobTitle:
      return gt`Job Title`;
    case ContactColumn.Company:
      return gt`Company`;
    case ContactColumn.Department:
      return gt`Department`;
    case ContactColumn.EMail:
      return gt`E-mail`;
    case ContactColumn.EMail2:
      return gt`E-mail 2`;
    case ContactColumn.EMail3:
      return gt`E-mail 3`;
    case ContactColumn.BusinessPhone:
      return gt`Business Phone`;
    case ContactColumn.BusinessPhone2:
      return gt`Business Phone 2`;
    case ContactColumn.BusinessFax:
      return gt`Business Fax`;
    case ContactColumn.HomePhone:
      return gt`Home Phone`;
    case ContactColumn.HomePhone2:
      return gt`Home Phone 2`;
    case ContactColumn.HomeFax:
      return gt`Home Fax`;
    case ContactColumn.MobilePhone:
      return gt`Mobile Phone`;
    case ContactColumn.OtherPhone:
      return gt`Other Phone`;
    case ContactColumn.OtherFax:
      return gt`Other Fax`;
    case ContactColumn.BusinessAddress:
      return gt`Business Address`;
    case ContactColumn.BusinessStreet:
      return gt`Business Street`;
    case ContactColumn.BusinessCity:
      return gt`Business City`;
    case ContactColumn.BusinessState:
      return gt`Business State`;
    case ContactColumn.BusinessPostalCode:
      return gt`Business Postal Code`;
    case ContactColumn.BusinessCountry:
      return gt`Business Country/Region`;
    case ContactColumn.HomeAddress:
      return gt`Home Address`;
    case ContactColumn.HomeStreet:
      return gt`Home Street`;
    case ContactColumn.HomeCity:
      return gt`Home City`;
    case ContactColumn.HomeState:
      return gt`Home State`;
    case ContactColumn.HomePostalCode:
      return gt`Home Postal Code`;
    case ContactColumn.HomeCountry:
      return gt`Home Country/Region`;
    case ContactColumn.OtherAddress:
      return gt`Other Address`;
    case ContactColumn.WebPage:
      return gt`Web Page`;
    case ContactColumn.IMAddress:
      return gt`IM Address`;
    case ContactColumn.Notes:
      return gt`Notes`;
    case ContactColumn.InFolder:
      return gt`In Folder`;
    }
    return column;
  }

  static width(column: ContactColumn): string {
    switch (column) {
    case ContactColumn.FullName:
      return "minmax(180px, 1.6fr)";
    case ContactColumn.EMail:
    case ContactColumn.EMail2:
    case ContactColumn.EMail3:
    case ContactColumn.BusinessAddress:
    case ContactColumn.HomeAddress:
    case ContactColumn.OtherAddress:
    case ContactColumn.Notes:
    case ContactColumn.WebPage:
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
    if (column == ContactColumn.InFolder) {
      return contact.addressbook?.name ?? "";
    }
    if (!(contact instanceof Person)) {
      return column == ContactColumn.JobTitle ? gt`Contact group` : "";
    }
    const kPhoneSlots: Partial<Record<ContactColumn, string>> = {
      [ContactColumn.BusinessPhone]: "business",
      [ContactColumn.BusinessPhone2]: "business2",
      [ContactColumn.BusinessFax]: "business-fax",
      [ContactColumn.HomePhone]: "home",
      [ContactColumn.HomePhone2]: "home2",
      [ContactColumn.HomeFax]: "home-fax",
      [ContactColumn.MobilePhone]: "mobile",
      [ContactColumn.OtherPhone]: "other",
      [ContactColumn.OtherFax]: "other-fax",
    };
    if (kPhoneSlots[column]) {
      return ContactSlots.phoneSlot(kPhoneSlots[column]).valueIn(contact.phoneNumbers);
    }
    const kAddressParts: Partial<Record<ContactColumn, { slot: number, part: AddressPart | null }>> = {
      [ContactColumn.BusinessAddress]: { slot: 0, part: null },
      [ContactColumn.BusinessStreet]: { slot: 0, part: "street" },
      [ContactColumn.BusinessCity]: { slot: 0, part: "city" },
      [ContactColumn.BusinessState]: { slot: 0, part: "state" },
      [ContactColumn.BusinessPostalCode]: { slot: 0, part: "postalCode" },
      [ContactColumn.BusinessCountry]: { slot: 0, part: "country" },
      [ContactColumn.HomeAddress]: { slot: 1, part: null },
      [ContactColumn.HomeStreet]: { slot: 1, part: "street" },
      [ContactColumn.HomeCity]: { slot: 1, part: "city" },
      [ContactColumn.HomeState]: { slot: 1, part: "state" },
      [ContactColumn.HomePostalCode]: { slot: 1, part: "postalCode" },
      [ContactColumn.HomeCountry]: { slot: 1, part: "country" },
      [ContactColumn.OtherAddress]: { slot: 2, part: null },
    };
    let address = kAddressParts[column];
    if (address) {
      let value = ContactSlots.addressSlots[address.slot].valueIn(contact.streetAddresses);
      return address.part ? ContactColumns.addressPart(value, address.part) : ContactColumns.addressText(value);
    }
    switch (column) {
    case ContactColumn.FirstName:
      return contact.firstName ?? "";
    case ContactColumn.LastName:
      return contact.lastName ?? "";
    case ContactColumn.JobTitle:
      return contact.position ?? "";
    case ContactColumn.Company:
      return contact.company ?? "";
    case ContactColumn.Department:
      return contact.department ?? "";
    case ContactColumn.EMail:
      return PreferredEntry.valueOf(contact.emailAddresses) ?? "";
    case ContactColumn.EMail2:
      return ContactSlots.emailSlots[1].valueIn(contact.emailAddresses);
    case ContactColumn.EMail3:
      return ContactSlots.emailSlots[2].valueIn(contact.emailAddresses);
    case ContactColumn.WebPage:
      return PreferredEntry.valueOf(contact.urls) ?? "";
    case ContactColumn.IMAddress:
      return PreferredEntry.valueOf(contact.chatAccounts) ?? "";
    case ContactColumn.Notes:
      return (contact.notes ?? "").replace(/\s+/g, " ").trim();
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

  static addressPart(value: string, part: AddressPart): string {
    if (!value) {
      return "";
    }
    try {
      return new StreetAddress(value)[part] ?? "";
    } catch (ex) {
      return part == "street" ? value : "";
    }
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
