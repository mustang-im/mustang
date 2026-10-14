import { MAPIAddressBookEntryID, MAPIEntryID, MAPIStoreEntryID } from "./MAPIEntryID";
import { ensureArray } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class ExchangeNavigationShortcut {
  readonly name: string;
  readonly itemClass: string | null;
  readonly type: number | null;
  readonly section: number | null;
  readonly folderEntryID: MAPIEntryID | null;
  readonly storeEntryID: MAPIStoreEntryID | null;
  readonly addressBookEntryID: MAPIAddressBookEntryID | null;

  static readonly kFolderName = "Common Views";
  static readonly kItemClass = "IPM.Microsoft.WunderBar.Link";
  static readonly kSharedFolderType = 2;
  static readonly kCalendarSection = 3;
  static readonly kProperties = {
    type: { tag: 0x6849, type: "Integer" },
    section: { tag: 0x6852, type: "Integer" },
    folderEntryID: { tag: 0x684C, type: "Binary" },
    storeEntryID: { tag: 0x684E, type: "Binary" },
    addressBookEntryID: { tag: 0x6854, type: "Binary" },
  };
  static readonly kStaleErrors = [
    "ErrorNameResolutionNoResults",
    "ErrorNonExistentMailbox",
    "ErrorFolderNotFound",
    "ErrorItemNotFound",
    "ErrorAccessDenied",
  ];

  constructor(ewsItem: any) {
    let values = new Map<number, string>();
    for (let property of ensureArray(ewsItem?.ExtendedProperty)) {
      values.set(Number(property?.ExtendedFieldURI?.PropertyTag), property?.Value);
    }
    let properties = ExchangeNavigationShortcut.kProperties;
    this.name = sanitize.label(ewsItem?.Subject, "");
    this.itemClass = sanitize.string(ewsItem?.ItemClass, null);
    this.type = sanitize.integer(values.get(properties.type.tag), null);
    this.section = sanitize.integer(values.get(properties.section.tag), null);
    this.folderEntryID = MAPIEntryID.fromBase64(values.get(properties.folderEntryID.tag));
    this.storeEntryID = MAPIStoreEntryID.fromBase64(values.get(properties.storeEntryID.tag));
    this.addressBookEntryID = MAPIAddressBookEntryID.fromBase64(values.get(properties.addressBookEntryID.tag));
  }

  get ownerLegacyDN(): string | null {
    return this.addressBookEntryID?.legacyDN ?? this.storeEntryID?.mailboxDN ?? null;
  }

  get isDefaultCalendar(): boolean {
    return !!this.addressBookEntryID?.legacyDN;
  }

  get isCalendarOfOtherUser(): boolean {
    return this.itemClass == ExchangeNavigationShortcut.kItemClass &&
      this.section == ExchangeNavigationShortcut.kCalendarSection &&
      this.type == ExchangeNavigationShortcut.kSharedFolderType &&
      !!this.ownerLegacyDN &&
      (this.isDefaultCalendar || !!this.folderEntryID?.bytes.length);
  }
}
