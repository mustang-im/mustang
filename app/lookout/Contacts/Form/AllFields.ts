import { ContactEntry, type Person } from "../../../logic/Abstract/Person";
import { ContactColumns } from "../Views/ContactColumns";
import type { ArrayColl } from "svelte-collections";
import { gt } from "../../../l10n/l10n";

export type FieldSet = "user-defined" | "email" | "phone" | "address" | "internet" | "all";
type FieldKind = "custom" | "email" | "phone" | "address" | "web" | "chat";

export interface FieldRow {
  entry: ContactEntry;
  list: ArrayColl<ContactEntry>;
  kind: FieldKind;
  name: string;
}

export class AllFields {
  static rows(person: Person, fieldSet: FieldSet): FieldRow[] {
    let lists: [FieldKind, ArrayColl<ContactEntry>][] = [
      ["custom", person.custom],
      ["email", person.emailAddresses],
      ["phone", person.phoneNumbers],
      ["address", person.streetAddresses],
      ["web", person.urls],
      ["chat", person.chatAccounts],
    ];
    let shown = lists.filter(([kind]) => AllFields.isIn(kind, fieldSet));
    return shown.flatMap(([kind, list]) => list.contents.map(entry => ({
      entry,
      list,
      kind,
      name: AllFields.fieldName(kind, entry),
    })));
  }

  static isIn(kind: FieldKind, fieldSet: FieldSet): boolean {
    switch (fieldSet) {
      case "user-defined":
        return kind == "custom";
      case "email":
        return kind == "email";
      case "phone":
        return kind == "phone";
      case "address":
        return kind == "address";
      case "internet":
        return kind == "web" || kind == "chat";
      default:
        return true;
    }
  }

  static fieldName(kind: FieldKind, entry: ContactEntry): string {
    let purpose = entry.purposeLabel;
    switch (kind) {
      case "custom":
        return entry.purpose || gt`User field`;
      case "email":
        return purpose ? gt`E-mail (${purpose})` : gt`E-mail`;
      case "phone":
        return purpose ? gt`Phone (${purpose})` : gt`Phone`;
      case "address":
        return purpose ? gt`Address (${purpose})` : gt`Address`;
      case "web":
        return gt`Web page`;
      case "chat":
        return purpose || entry.protocol ? gt`IM address (${purpose || entry.protocol})` : gt`IM address`;
    }
  }

  static valueText(row: FieldRow): string {
    return row.kind == "address"
      ? ContactColumns.addressText(row.entry.value).replace(/\n/g, ", ")
      : row.entry.value ?? "";
  }

  static isEditable(row: FieldRow): boolean {
    return row.kind != "address";
  }

  static addUserField(person: Person, name: string): ContactEntry {
    let entry = new ContactEntry("", name.trim());
    person.custom.add(entry);
    return entry;
  }
}
