import { Folder, SpecialFolder } from "../Folder";
import type { SearchEMail } from "../SQL/SearchEMail";
import { SQLSearchEMail } from "../SQL/SQLSearchEMail";
import type { AllAccounts } from "./AllAccounts";
import type { EMail } from "../EMail";
import { allAccountsAccount } from "../AccountsList/ShowAccounts";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, NotReached } from "../../util/util";
import { Collection, ArrayColl } from "svelte-collections";

export class SavedSearchFolder extends Folder {
  account: AllAccounts;
  _foldersDummy = new ArrayColl<Folder>();
  search: SearchEMail;

  constructor(search: SearchEMail) {
    super(allAccountsAccount);
    this.search = search;
  }

  get path(): string {
    return this.name;
  }
  set path(val: string) {
    this.name = val;
  }
  get folders(): Collection<Folder> {
    return this._foldersDummy;
  }
  set folders(val: Collection<Folder>) {
    throw new NotReached();
  }

  async listMessages() {
    let messages = await this.search.startSearch();
    this.messages.clear();
    this.messages.addAll(messages);
  }

  async downloadAllMessages() {
    return new ArrayColl<EMail>();
  }

  static readFromJSON(json: any): SavedSearchFolder {
    let search = new SQLSearchEMail();
    search.fromJSON(json);
    let folder = new SavedSearchFolder(search);
    folder.name = sanitize.label(json.name, "Search");
    return folder;
  }

  toJSON() {
    let json: any = this.search.toJSON();
    json.name = this.name;
    return json;
  }

  newEMail(): EMail {
    let account = this.account.accounts.first;
    assert(account, "Setup and select email account first");
    let folder = account.getSpecialFolder(SpecialFolder.Sent);
    assert(folder, `No folder found in account ${account.name}`);
    return folder.newEMail();
  }

  async save() {
    if (!savedSearchFolders.contains(this)) {
      savedSearchFolders.add(this);
    }
    saveSavedSearches();
  }

  async deleteIt() {
    savedSearchFolders.remove(this);
    saveSavedSearches();
  }

  async moveMessagesHere(messages: Collection<EMail>) {
    throw new Error(`${this.name} is a saved search. You cannot move messages here.`);
  }
  async copyMessagesHere(messages: Collection<EMail>) {
    throw new Error(`${this.name} is a saved search. You cannot move messages here.`);
  }
  async moveFolderHere(folder: Folder) {
    throw new Error(`${this.name} is a saved search. You cannot move messages here.`);
  }
  async createSubFolder(name: string): Promise<Folder> {
    throw new Error(`${this.name} is a saved search. You cannot move messages here.`);
  }
}

export const savedSearchFolders = new ArrayColl<SavedSearchFolder>();

/** Called on startup only.
 * Populates `savedSearchFolders` and saves to localStorage. */
export function readSavedSearches() {
  try {
    assert(savedSearchFolders.isEmpty, "Already read saved searches. Call this only once at startup");
    let arrayJSON = JSON.parse(localStorage.getItem("savedSearches") || "[]");
    assert(Array.isArray(arrayJSON), "Could not read saved searches");
    for (let searchJSON of arrayJSON) {
      try {
        savedSearchFolders.add(SavedSearchFolder.readFromJSON(searchJSON));
      } catch (ex) {
        backgroundError(ex);
      }
    }
  } catch (ex) {
    backgroundError(ex);
  }
  allAccountsAccount.rootFolders.addColl(savedSearchFolders);
}

/** Called whenever saved searches have been modified.
 * Saves to localStorage. */
export function saveSavedSearches() {
  let arrayJSON = savedSearchFolders.contents.map(folder => folder.toJSON());
  localStorage.setItem("savedSearches", JSON.stringify(arrayJSON, null, 2));
}
