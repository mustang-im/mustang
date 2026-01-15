import { SMLProcessor } from "./SMLProcessor";
import type { EMail } from "../EMail";
import { getBaseDomainFromURL, getDomainForEmailAddress } from "../../util/netUtil";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { SMLHTTPAccount } from "./SMLHTTPAccount";

/**
 * Automatically answers registration email confirmations for the SML HTTP server.
 * Only if the server is ours or the email hoster itself.
 */
export abstract class RegisterSMLProcessor extends SMLProcessor {
  types = ["EMailRegisterAction"];
  context = "https://sml.mustang.im";
  async processSML(email: EMail, sml: any): Promise<void> {
    assert(sml.object?.["@type"] == "Account", "Not an account registration");
    let emailAddress = sanitize.emailAddress(sml.object.emailAddress);
    assert(email.folder.account.isMyEMailAddress(emailAddress), "EMail address in registration does not match the email account");
    let smlAccount = SMLHTTPAccount.getAccount(emailAddress);
    assert(smlAccount, "Ignoring registration for an account that we didn't request");

    let confirmURL = sanitize.url(sml.target);
    let emailDomain = getDomainForEmailAddress(emailAddress);
    let domain = getBaseDomainFromURL(confirmURL);
    // Make sure that it's a trusted domain before confirming: Either our server or the email hoster
    assert(domain == emailDomain || trustedDomains.includes(domain), "Ignoring registration request for unknown domain " + domain);
    let oAuth2Call = await fetch(confirmURL) as any;
    let oAuth2Response = await oAuth2Call.json();
    smlAccount.accessToken = sanitize.nonemptystring(oAuth2Response.access_token);
    await email.deleteMessage();
    console.log("Registration for", emailAddress, "on", domain, "completed automatically");
  };
}

// Fallback servers, when ISP doesn't offer the server
const trustedDomains = ["mustang.im", "beonex.com", "parula.app"];
