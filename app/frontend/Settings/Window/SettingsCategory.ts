import type { Account } from "../../../logic/Abstract/Account";
import { Observable, notifyChangedProperty } from "../../../logic/util/Observable";
import { ArrayColl, Collection } from "svelte-collections";

export class SettingsCategory extends Observable {
  id: string;
  /** User-visible name of the category */
  name: string;
  description: string | null;
  /** Alternative words for `name` that the user might think of. Used for searching settings. */
  synonyms = new ArrayColl<string>();
  /** Icon, either as SVG string or as Svelte component */
  icon: string | ConstructorOfATypedSvelteComponent;

  isMain = false;
  isAccountSpecific = false;
  /** Window content with the actual settings that shows on the right
   * when the user selected this settings category */
  windowContent: ConstructorOfATypedSvelteComponent | undefined;

  @notifyChangedProperty
  subCategories: Collection<SettingsCategory> = new ArrayColl<SettingsCategory>();

  /** mail, chat etc. accounts for this app/category */
  @notifyChangedProperty
  accounts: Collection<Account> = new ArrayColl<Account>();
  newAccountUI: ConstructorOfATypedSvelteComponent | undefined;

  constructor(id: string, name: string, isAccountSpecific = false, isMain = false, content?: ConstructorOfATypedSvelteComponent) {
    super();
    this.id = id;
    this.name = name;
    this.isMain = isMain;
    this.isAccountSpecific = isAccountSpecific;
    this.windowContent = content;
  }

  searchMatchesDirect(searchTerm: string) {
    if (!searchTerm || searchTerm.length < 2) {
      return false;
    }
    searchTerm = searchTerm.toLowerCase();
    return this.name.toLowerCase().includes(searchTerm) ||
      this.synonyms.some(word => word.toLowerCase().includes(searchTerm)) ||
      this.description?.toLowerCase().includes(searchTerm);
  }
}
