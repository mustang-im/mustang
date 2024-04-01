import type { MailAccount } from "../MailAccount";
import { fetchConfig, getDomainForEmailAddress } from "./fetchConfig";
import type { ArrayColl } from "svelte-collections";

export async function findConfig(emailAddress: string, password: string, abort: AbortController): Promise<ArrayColl<MailAccount>> {
  let domain = getDomainForEmailAddress(emailAddress);
  return await fetchConfig(domain, emailAddress, abort);
}
