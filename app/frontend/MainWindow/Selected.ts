import type { Workspace } from "../../logic/Abstract/Workspace";
import type { URLString } from "../../logic/util/util";
import { writable, type Writable } from "svelte/store";

export const selectedWorkspace = writable<Workspace>();

/** Hack. Modify this store when you change the `Account.workspace`
 * of any account. This signals the UI to refresh the account lists.
 * The value of the store does not matter. */
export const changedWorkspace = writable(1);

/** Set, if user clicks on a link in the UI, e.g. mailto: or similar */
export const linkClickURL: Writable<URLString | null> = writable(null);
