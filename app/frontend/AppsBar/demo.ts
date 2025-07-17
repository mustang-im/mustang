import { production } from "../../logic/build";
import type { MailAccount } from "../../logic/Mail/MailAccount";
import type { Addressbook } from "../../logic/Contacts/Addressbook";
import type { Calendar } from "../../logic/Calendar/Calendar";
import { ArrayColl } from "svelte-collections";
import { writable } from "svelte/store";

export const isDemo = writable(false);

export const realEmailAccounts = new ArrayColl<MailAccount>();
export const realAddressbooks = new ArrayColl<Addressbook>();
export const realCalendars = new ArrayColl<Calendar>();
