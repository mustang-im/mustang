import type { MailAccount } from "../MailAccount";
import { fetchConfig } from "./fetchConfig";
import { exchangeAutoDiscoverV1XML, exchangeAutoDiscoverV2JSON } from "./exchangeConfig";
import { guessConfig } from "./guessConfig";
import { getDomainForEmailAddress } from "../../util/netUtil";
import { ArrayColl } from "svelte-collections";

export async function findConfig(emailAddress: string, password: string, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  let domain = getDomainForEmailAddress(emailAddress);
  try {
    return await fetchConfig(domain, emailAddress, abort);
  } catch (ex) {
    console.log(`Fetch config for ${emailAddress} failed`);
  }
  try {
    return await exchangeAutoDiscoverV1XML(domain, emailAddress, abort);
  } catch (ex) {
    console.log(`Fetch config for ${emailAddress} failed`);
  }
  try {
    let config = await guessConfig(domain, emailAddress, abort);
    return new ArrayColl([config as any as MailAccount]);
  } catch (ex) {
    console.log(`Guess config for ${emailAddress} failed`);
  }
}
