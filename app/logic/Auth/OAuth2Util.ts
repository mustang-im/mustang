import type { WebBasedAuth } from "./WebBasedAuth";
import { OAuth2URLs } from "./OAuth2URLs";
import { OAuth2 } from "./OAuth2";
import { OWAAuth } from "./OWAAuth";
import type { MailAccount } from "../Mail/MailAccount";
import type { OWAAccount } from "../Mail/OWA/OWAAccount";

export function getOAuth2BuiltIn(config: MailAccount): WebBasedAuth | undefined {
  if (config.protocol == "owa") {
    return new OWAAuth(config as OWAAccount);
  }
  let o = OAuth2URLs.find(o => o.hostnames.some(h => h == config.hostname));
  if (!o) {
    return undefined;
  }
  let oAuth2 = new OAuth2(config, o.tokenURL, o.authURL, o.authDoneURL, o.scope, o.clientID, o.clientSecret, o.doPKCE);
  oAuth2.setTokenURLPasswordAuth(o.tokenURLPasswordAuth);
  return oAuth2;
}
