import { MAPIEntryID } from "./MAPIEntryID";

export class MAPIAddressBookEntryID extends MAPIEntryID {
  static readonly kProviderUID = "DCA740C8C042101AB4B908002B2FE182";

  get legacyDN(): string | null {
    if (this.bytes.length < 29 || this.providerUID != MAPIAddressBookEntryID.kProviderUID) {
      return null;
    }
    return this.readASCII(28).text;
  }
}
