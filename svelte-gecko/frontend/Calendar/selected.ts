import { writable, type Writable } from "svelte/store";

export let selectedShowDate = writable(new Date());
export type DateInterval = 1 | 7 | 31 | 28;
export let selectedDateInterval = writable(7 as DateInterval);
