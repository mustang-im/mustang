import type { OAuth2UI } from "./OAuth2UI";
import { OAuth2SystemBrowser } from "./OAuth2SystemBrowser";
import { OAuth2Embed } from "./OAuth2Embed";
import { OAuth2Tab } from "./OAuth2Tab";
import { OAuth2Window } from "./OAuth2Window";
import type { OAuth2 } from "../OAuth2";
import { NotReached } from "../../util/util";

export enum OAuth2UIMethod {
  Embed = "embed",
  Tab = "tab",
  Window = "window",
  SystemBrowser = "browser",
}

export function newOAuth2UI(method: OAuth2UIMethod, oAuth2: OAuth2): OAuth2UI {
  if (method == OAuth2UIMethod.SystemBrowser) {
    return new OAuth2SystemBrowser(oAuth2);
  } else if (method == OAuth2UIMethod.Embed) {
    return new OAuth2Embed(oAuth2);
  } else if (method == OAuth2UIMethod.Tab) {
    return new OAuth2Tab(oAuth2);
  } else if (method == OAuth2UIMethod.Window) {
    return new OAuth2Window(oAuth2);
  } else {
    throw new NotReached();
  }
}
