import { MailAccount } from "../MailAccount";
import { appGlobal } from "../../app";
import { mergeColl, Collection, ArrayColl } from "svelte-collections";
import { AllAccounts } from "./AllAccounts";

const allAccountsAsCollection = new ArrayColl([new AllAccounts(appGlobal.emailAccounts)]) as any as Collection<MailAccount>;

export const showAccounts: Collection<MailAccount> = mergeColl(allAccountsAsCollection, appGlobal.emailAccounts);
