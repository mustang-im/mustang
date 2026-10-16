import { getLocalStorage } from "../../../frontend/Util/LocalStorage";

export class ComposerSettings {
  static readonly sendFormat = getLocalStorage<string>("mail.send.format", "html");
  static readonly showFrom = getLocalStorage<boolean>("lookout.mail.compose.showFrom", true);
  static readonly showBcc = getLocalStorage<boolean>("lookout.mail.compose.showBcc", false);
  static readonly repliesInNewWindow = getLocalStorage<boolean>("lookout.mail.compose.repliesInNewWindow", false);
}
