/**
 * A third party web app listed in our app store.
 * The user can select and use this app.
 */
export default class AppListed {
  /** e.g. "microsoft-word" */
  id: string;
  /** e.g. `"productivity|word-processing"` */
  categoryFullID: string;
  /** Human-readable name,
   * translated into the user's language.
   * Must be short, i.e. 1-2 words.
   * Use "en" as fallback.
   * iso 2-letter lang code -> name
   * e.g. `{
   *   "en": "Microsoft Word",
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
  /** Description of the application, by the vendor itself.
   * URL */
  homepage: string;
  /** Page which describes the pricing options.
   * URL */
  pricePage: string;
  /** Launch the application itself.
   * URL */
  start: string;

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

  static fromJSON(json: any): AppListed {
    let result = new AppListed();
    const props = ['id', 'categoryFullID', 'name', 'description', 'icon', 'homepage', 'pricePage', 'start',];
    for (let name in json) {
      if (!props.includes(name)) {
        continue;
      }
      result[name] = json[name];
    }
    return result;
  }
}
