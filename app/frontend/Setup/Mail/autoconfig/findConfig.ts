import type { MailAccount } from "../../../../logic/Mail/MailAccount";
import type { ArrayColl } from "svelte-collections";
import { fetchConfig, getDomainForEmailAddress } from "./fetchConfig";

export async function findConfig(emailAddress: string, password: string): Promise<ArrayColl<MailAccount>> {
  let domain = getDomainForEmailAddress(emailAddress);
  return await fetchConfig(domain, emailAddress);
}
