import type { WebAppListed } from "./WebAppListed";
import { ArrayColl } from "svelte-collections";
import { getUILocale } from "../../l10n/l10n";
import { sourceLocale } from "../../l10n/list";

export class WebAppCategory {
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

  readonly apps = new ArrayColl<WebAppListed>();

  /** The name in the user's language, or a fallback when not available */
  get nameTranslated(): string {
    return this.name[getUILocale()] ??
      this.name[sourceLocale] ??
      "";
  }
  /** The description in the user's language, or a fallback when not available */
  get descriptionTranslated(): string {
    return this.description[getUILocale()] ??
      this.description[sourceLocale] ??
      "";
  }

  static fromJSON(json: any): WebAppCategory {
    let result = new WebAppCategory();
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
