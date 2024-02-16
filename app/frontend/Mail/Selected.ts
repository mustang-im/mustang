import type MailAccount from "../../../lib/logic/mail/MailAccount";
import type Folder from "../../../lib/logic/account/MsgFolder";
import type EMail from "../../../lib/logic/mail/EMail";
import { writable } from "svelte/store";

export const selectedAccount = writable<MailAccount>();
export const selectedFolder = writable<Folder>();
export const selectedMessage = writable<EMail>();
