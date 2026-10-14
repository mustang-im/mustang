import { MAPIEntryID } from "./MAPIEntryID";

export class MAPIStoreEntryID extends MAPIEntryID {
  static readonly kProviderUID = "38A1BB1005E5101AA1BB08002B2A56C2";

  get mailboxDN(): string | null {
    if (this.bytes.length < 61 || this.providerUID != MAPIStoreEntryID.kProviderUID) {
      return null;
    }
    let server = this.readASCII(60);
    if (!server.text) {
      return null;
    }
    return this.readASCII(server.end + 1).text;
  }
}
