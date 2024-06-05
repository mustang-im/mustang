import type { MailAccount } from "../MailAccount";
import { fetchConfig } from "./fetchConfig";
import { exchangeAutoDiscoverV1XML, exchangeAutoDiscoverV2JSON } from "./exchangeConfig";
import { guessConfig } from "./guessConfig";
import { PriorityAbortable } from "../../util/Abortable";
import { getDomainForEmailAddress } from "../../util/netUtil";
import { ArrayColl } from "svelte-collections";

export async function findConfig(emailAddress: string, password: string, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  let domain = getDomainForEmailAddress(emailAddress);
  try {
    let priorityOrder = new PriorityAbortable(abort, [
      fetchConfig(domain, emailAddress, abort),
      //exchangeAutoDiscoverV2JSON(domain, emailAddress, abort),
    ]);
    return await priorityOrder.run();
  } catch (ex) {
    console.log(`Fetch config for ${emailAddress} failed`);
  }
  try {
    //return await exchangeAutoDiscoverV1XML(domain, emailAddress, null, password, () => false, abort);
  } catch (ex) {
    console.log(`AutoDiscover for ${emailAddress} failed`);
  }
  try {
    let config = await guessConfig(domain, emailAddress, abort);
    return new ArrayColl([config as any as MailAccount]);
  } catch (ex) {
    console.log(`Guess config for ${emailAddress} failed`);
  }
}
