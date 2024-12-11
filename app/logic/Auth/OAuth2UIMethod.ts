// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { OAuth2UI } from "./OAuth2UI";
import { OAuth2SystemBrowser } from "./OAuth2SystemBrowser";
import { OAuth2Dialog } from "./OAuth2Dialog";
import { OAuth2Window } from "./OAuth2Window";
import type { OAuth2 } from "./OAuth2";
import { NotReached } from "../util/util";

export enum OAuth2UIMethod {
  Dialog = "dialog",
  Window = "window",
  SystemBrowser = "browser",
}

export function newOAuth2UI(method: OAuth2UIMethod, oAuth2: OAuth2): OAuth2UI {
  if (method == OAuth2UIMethod.SystemBrowser) {
    return new OAuth2SystemBrowser(oAuth2);
  } else if (method == OAuth2UIMethod.Dialog) {
    return new OAuth2Dialog(oAuth2);
  } else if (method == OAuth2UIMethod.Window) {
    return new OAuth2Window(oAuth2);
  } else {
    throw new NotReached();
  }
}
