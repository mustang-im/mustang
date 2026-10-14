import { MAPIEntryID } from "../../Mail/EWS/MAPIEntryID";
import { MAPIAddressBookEntryID } from "../../Mail/EWS/MAPIAddressBookEntryID";
import { MAPIStoreEntryID } from "../../Mail/EWS/MAPIStoreEntryID";
import { ensureArray } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class EWSCalendarShortcut {
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

  constructor(item: any) {
    let values = new Map<number, string>();
    for (let property of ensureArray(item?.ExtendedProperty)) {
      values.set(Number(property?.ExtendedFieldURI?.PropertyTag), property?.Value);
    }
    let properties = EWSCalendarShortcut.kProperties;
    this.itemClass = sanitize.string(item?.ItemClass, null);
    this.type = sanitize.integer(values.get(properties.type.tag), null);
    this.section = sanitize.integer(values.get(properties.section.tag), null);
    this.folderEntryID = MAPIEntryID.fromBase64(values.get(properties.folderEntryID.tag));
    this.storeEntryID = MAPIStoreEntryID.fromBase64(values.get(properties.storeEntryID.tag));
    this.addressBookEntryID = MAPIAddressBookEntryID.fromBase64(values.get(properties.addressBookEntryID.tag));
  }

  get ownerLegacyDN(): string | null {
    return this.addressBookEntryID?.legacyDN ?? this.storeEntryID?.mailboxDN ?? null;
  }

  get hasFolder(): boolean {
    return !!this.folderEntryID?.bytes.length;
  }

  get isCalendarOfOtherUser(): boolean {
    return this.itemClass == EWSCalendarShortcut.kItemClass &&
      this.section == EWSCalendarShortcut.kCalendarSection &&
      this.type == EWSCalendarShortcut.kSharedFolderType &&
      !!this.ownerLegacyDN &&
      (this.hasFolder || !!this.addressBookEntryID?.legacyDN);
  }
}
