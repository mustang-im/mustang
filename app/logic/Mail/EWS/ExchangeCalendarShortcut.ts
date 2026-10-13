import { base64ToUint8Array, ensureArray } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export const kCommonViewsFolderName = "Common Views";
export const kNavigationShortcutClass = "IPM.Microsoft.WunderBar.Link";

export enum ShortcutProperty {
  Type = 0x6849,
  EntryID = 0x684C,
  StoreEntryID = 0x684E,
  Section = 0x6852,
  AddressBookEntryID = 0x6854,
}

export const kShortcutProperties: { tag: ShortcutProperty, type: "Integer" | "Binary" }[] = [
  { tag: ShortcutProperty.Type, type: "Integer" },
  { tag: ShortcutProperty.Section, type: "Integer" },
  { tag: ShortcutProperty.EntryID, type: "Binary" },
  { tag: ShortcutProperty.StoreEntryID, type: "Binary" },
  { tag: ShortcutProperty.AddressBookEntryID, type: "Binary" },
];

const kSharedFolderType = 2;
const kCalendarSection = 3;
const kAddressBookProviderUID = "DCA740C8C042101AB4B908002B2FE182";
const kStoreWrapProviderUID = "38A1BB1005E5101AA1BB08002B2A56C2";

export interface SharedCalendarShortcut {
  name: string;
  ownerLegacyDN: string;
  isDefaultCalendar: boolean;
  folderEntryID: string | null;
}

export function propertyTagHex(tag: ShortcutProperty): string {
  return "0x" + tag.toString(16).toUpperCase();
}

export function parseSharedCalendarShortcut(item: any): SharedCalendarShortcut | null {
  if (item?.ItemClass != kNavigationShortcutClass) {
    return null;
  }
  let properties = new Map<number, string>();
  for (let property of ensureArray(item.ExtendedProperty)) {
    properties.set(Number(property?.ExtendedFieldURI?.PropertyTag), property?.Value);
  }
  if (Number(properties.get(ShortcutProperty.Section)) != kCalendarSection ||
      Number(properties.get(ShortcutProperty.Type)) != kSharedFolderType) {
    return null;
  }
  let name = sanitize.label(item.Subject, "");
  let entryID = decodeEntryID(properties.get(ShortcutProperty.EntryID));
  let folderEntryID = entryID?.length ? toHex(entryID) : null;
  let ownerLegacyDN = legacyDNFromAddressBookEntryID(decodeEntryID(properties.get(ShortcutProperty.AddressBookEntryID)));
  if (ownerLegacyDN) {
    return { name, ownerLegacyDN, isDefaultCalendar: true, folderEntryID };
  }
  ownerLegacyDN = mailboxDNFromStoreEntryID(decodeEntryID(properties.get(ShortcutProperty.StoreEntryID)));
  if (!ownerLegacyDN || !folderEntryID) {
    return null;
  }
  return { name, ownerLegacyDN, isDefaultCalendar: false, folderEntryID };
}

export function legacyDNFromAddressBookEntryID(entryID: Uint8Array | null): string | null {
  if (!entryID || entryID.length < 29 ||
      toHex(entryID.subarray(4, 20)) != kAddressBookProviderUID) {
    return null;
  }
  return readASCII(entryID, 28).text;
}

export function mailboxDNFromStoreEntryID(entryID: Uint8Array | null): string | null {
  if (!entryID || entryID.length < 61 ||
      toHex(entryID.subarray(4, 20)) != kStoreWrapProviderUID) {
    return null;
  }
  let server = readASCII(entryID, 60);
  if (!server.text) {
    return null;
  }
  return readASCII(entryID, server.end + 1).text;
}

function decodeEntryID(base64: string | null | undefined): Uint8Array | null {
  if (!base64) {
    return null;
  }
  try {
    return base64ToUint8Array(base64);
  } catch (ex) {
    return null;
  }
}

function readASCII(bytes: Uint8Array, start: number): { text: string | null, end: number } {
  let end = bytes.indexOf(0, start);
  if (end < 0) {
    end = bytes.length;
  }
  let text = String.fromCharCode(...bytes.subarray(start, end)).trim();
  return { text: text || null, end };
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}
