import type { MailAccount } from "../../../logic/Mail/MailAccount";
import type { Addressbook } from "../../../logic/Contacts/Addressbook";
import { ThunderbirdProfile } from "../../../logic/Mail/Import/Thunderbird/TBProfile";
import { ThunderbirdAddressbook } from "../../../logic/Mail/Import/Thunderbird/TBAddressbook";
import { appGlobal } from "../../../logic/app";
import { logError } from "../../../frontend/Util/error";

export class ImportChoice<T> {
  readonly item: T;
  selected: boolean;
  readonly isAdded: boolean;

  constructor(item: T, isAdded = false) {
    this.item = item;
    this.isAdded = isAdded;
    this.selected = !isAdded;
  }
}

export class ThunderbirdImport {
  accounts: ImportChoice<MailAccount>[] = [];
  addressbooks: ImportChoice<Addressbook>[] = [];
  isSearching = false;
  isSearched = false;
  isThunderbirdRunning = false;
  isInstalled = true;

  async search() {
    this.accounts = [];
    this.addressbooks = [];
    this.isThunderbirdRunning = false;
    this.isSearching = true;
    try {
      let profiles = await ThunderbirdImport.profiles();
      this.isInstalled = profiles.length > 0;
      for (let profile of profiles) {
        await this.readProfile(profile);
      }
    } finally {
      this.isSearching = false;
      this.isSearched = true;
    }
  }

  static async isThunderbirdInstalled(): Promise<boolean> {
    return (await ThunderbirdImport.profiles()).length > 0;
  }

  protected static async profiles(): Promise<ThunderbirdProfile[]> {
    // <copied from="../../../frontend/Setup/Import/SelectAccounts.svelte" startImport()>
    let profiles = await ThunderbirdProfile.findProfiles();
    return profiles.filter(p => p.name && !p.name.toLowerCase().includes("test"));
    // </copied>
  }

  protected async readProfile(profile: ThunderbirdProfile) {
    // <copied from="../../../frontend/Setup/Import/SelectAccounts.svelte" startImport()>
    try {
      let tbAccounts = await profile.readMailAccounts();
      this.accounts.push(...tbAccounts.map(account => new ImportChoice(account, ThunderbirdImport.isAdded(account))));
    } catch (ex) {
      console.log(ex?.message);
    }
    // </copied>
    // <copied from="../../../frontend/Setup/Import/SelectAddressbooks.svelte" startImport()>
    try {
      let abs = await ThunderbirdAddressbook.readAll(profile, ex => this.addressbookError(ex), ex => console.log(ex?.message ?? ex + ""));
      this.addressbooks.push(...abs.contents.map(addressbook => new ImportChoice<Addressbook>(addressbook)));
    } catch (ex) {
      this.addressbookError(ex);
    }
    // </copied>
  }

  protected addressbookError(ex: Error) {
    // <copied from="../../../frontend/Setup/Import/SelectAddressbooks.svelte" abErrorCallback()>
    let code = (ex as any)?.code;
    if (code == "SQLITE_BUSY" || code == "SQLITE_LOCKED") {
      this.isThunderbirdRunning = true;
      return;
    }
    logError(ex);
    // </copied>
  }

  static isAdded(account: MailAccount): boolean {
    return appGlobal.emailAccounts.some(existing => existing.emailAddress == account.emailAddress);
  }

  get selectedAccounts(): MailAccount[] {
    return this.accounts.filter(choice => choice.selected).map(choice => choice.item);
  }

  get selectedAddressbooks(): Addressbook[] {
    return this.addressbooks.filter(choice => choice.selected).map(choice => choice.item);
  }

  get hasSelection(): boolean {
    return this.selectedAccounts.length > 0 || this.selectedAddressbooks.length > 0;
  }

  async importAddressbooks() {
    // <copied from="../../../frontend/Setup/Import/SelectAddressbooks.svelte" onOK()>
    for (let addressbook of this.selectedAddressbooks) {
      appGlobal.addressbooks.add(addressbook);
      await addressbook.save();
      for (let person of addressbook.persons) {
        // Slow, and the next `addressbook.save()` will block on it
        await person.save();
      }
    }
    // </copied>
  }
}
