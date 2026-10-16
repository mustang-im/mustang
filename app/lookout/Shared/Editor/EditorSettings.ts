import { getLocalStorage } from "../../../frontend/Util/LocalStorage";

export class EditorSettings {
  static readonly spellcheck = getLocalStorage<boolean>("mail.send.spellcheck.enabled", false);
}
