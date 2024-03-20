import type { MailAccount } from "../../../../logic/Mail/MailAccount";
import { fetchConfig, getDomainForEmailAddress } from "./fetchConfig";
import type { ArrayColl } from "svelte-collections";

export async function findConfig(emailAddress: string, password: string): Promise<ArrayColl<MailAccount>> {
  let domain = getDomainForEmailAddress(emailAddress);
  return await fetchConfig(domain, emailAddress);
}
