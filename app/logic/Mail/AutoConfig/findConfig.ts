import type { MailAccount } from "../MailAccount";
import { fetchConfig } from "./fetchConfig";
import { exchangeAutoDiscoverV1XML, exchangeAutoDiscoverV2JSON, fetchV1, ConfirmExchangeRedirect } from "./exchangeConfig";
import { guessConfig } from "./guessConfig";
import { localConfig } from "./localConfig";
import { PriorityAbortable } from "../../util/flow/Abortable";
import { UserCancelled } from "../../util/util";
import { getDomainForEmailAddress, getBaseDomainFromHost } from "../../util/netUtil";
import { ArrayColl } from "svelte-collections";

/**
 * Use various methods and sources to find a server configuration for this email address.
 *
 * In order of preference:
 * 1. Autoconfig
 * 2. Exchange AutoDiscover V2 JSON
 * 3. Exchange AutoDiscover V1 XML
 * 4. Guessing common hostnames
 */
export async function findConfig(emailAddress: string, password: string, exchangeConfirmCallback: (emailAddress: string, redirectDomain: string) => Promise<boolean> | null, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  let domain = getDomainForEmailAddress(emailAddress);
  try {
    return await localConfig(domain);
  } catch (ex) {
  }
  try {
    console.log("Starting to fetch config for", emailAddress);
    let priorityOrder = new PriorityAbortable(abort, [
      fetchConfig(domain, emailAddress, abort),
      exchangeAutoDiscoverV2JSON(domain, emailAddress, abort),
    ]);
    return await priorityOrder.run();
  } catch (ex) {
    console.log(`Fetch config for ${emailAddress} failed:`, ex?.message);
  }
  try {
    console.log("Starting Exchange AutoDiscover V1 XML for", emailAddress);
    let configs = await exchangeAutoDiscoverV1XML(domain, emailAddress, null, password, abort);
    let confirm = configs.find(config => config instanceof ConfirmExchangeRedirect) as ConfirmExchangeRedirect;
    if (confirm) {
      let redirectURL = confirm.url;
      let redirectDomain = getBaseDomainFromHost(new URL(redirectURL).hostname);
      if (exchangeConfirmCallback &&
          await exchangeConfirmCallback(emailAddress, redirectDomain)) {
        return await fetchV1(redirectURL, confirm.callArgs, abort);
      } else {
        throw new UserCancelled();
      }
    } else {
      return configs;
    }
  } catch (ex) {
    console.log(`Exchange AutoDiscover for ${emailAddress} failed`);
  }
  try {
    console.log("Starting to guess config for", emailAddress);
    let config = await guessConfig(domain, emailAddress, abort);
    return new ArrayColl([config as any as MailAccount]);
  } catch (ex) {
    console.log(`Guess config for ${emailAddress} failed`);
  }
}
