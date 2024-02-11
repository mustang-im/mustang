import type AppListed from "./AppListed";
import { ArrayColl } from "svelte-collections";

export default class AppCategory {
  /** Internal ID, without parent categories.
   * E.g. `"word-processing"` */
  id: string;
  /** ID of the parent category.
   * E.g. `"productivity"` */
  parentID: string;
  /** full path of ID, with parent categories, from top level.
   * Separated by `/`.
   * E.g. `"productivity/word-processing"` */
  fullID: string;
  /** Human-readable name,
   * translated into the user's language.
   * Must be short, i.e. 1-2 words.
   * Use "en" as fallback.
   * iso 2-letter lang code -> name
   * e.g. `{
   *   "en": "Word processing",
   *   "de": "Textverarbeitung",
   * }`
   */
  name: Record<string, string>;
  /** Human-readable description, usually 1 paragraph,
  * translated into the user's language.
  * Same format as `name`. */
  description: Record<string, string>;
  /** URL path to an icon for this category.
   * Either absolute, or relative to the UI path. */
  icon: string;

  readonly apps = new ArrayColl<AppListed>();

  /** The name in the user's language, or a fallback when not available */
  get nameTranslated(): string {
    return this.name[navigator.language] ??
      this.name[navigator.language.substring(0, 2)] ??
      this.name['en'] ??
      "";
  }
  /** The description in the user's language, or a fallback when not available */
  get descriptionTranslated(): string {
    return this.description[navigator.language] ??
      this.description[navigator.language.substring(0, 2)] ??
      this.description['en'] ??
      "";
  }

  static fromJSON(json: any): AppCategory {
    let result = new AppCategory();
    const props = ['id', 'parentID', 'fullID', 'name', 'description', 'icon',];
    for (let name in json) {
      if (!props.includes(name)) {
        continue;
      }
      result[name] = json[name];
    }
    return result;
  }
}
