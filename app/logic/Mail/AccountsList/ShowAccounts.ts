// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { MailAccount } from "../MailAccount";
import { AllAccounts } from "../Virtual/AllAccounts";
import { appGlobal } from "../../app";
import { mergeColl, Collection, ArrayColl } from "svelte-collections";

export let allAccountsAccount = new AllAccounts(appGlobal.emailAccounts);
const allAccountsAsCollection = new ArrayColl([allAccountsAccount]) as any as Collection<MailAccount>;

export const showAccounts: Collection<MailAccount> = mergeColl(allAccountsAsCollection, appGlobal.emailAccounts);
