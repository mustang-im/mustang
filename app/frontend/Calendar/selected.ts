import type { Event } from "../../logic/Calendar/Event";
import type { Calendar } from "../../logic/Calendar/Calendar";
import { writable, type Writable } from "svelte/store";

export let selectedCalendar = writable<Calendar | null>(null);
/** Which event is highlighted right now. */
export let selectedEvent: Writable<Event> = writable(null);

export let selectedDate = writable(new Date());
export type DateInterval = 0 | 1 | 2 | 7 | 31 | 28;
export let selectedDateInterval = writable(2 as DateInterval);
export let startDate = writable(new Date());
