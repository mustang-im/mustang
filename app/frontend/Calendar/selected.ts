import type { Event } from "../../logic/Calendar/Event";
import type { Calendar } from "../../logic/Calendar/Calendar";
import { writable, type Writable } from "svelte/store";

/** Which event is highlighted right now. */
export let selectedEvent: Writable<Event> = writable(null);

/** Which event we're editing right now. Normally null = not open. */
export let editingEvent: Writable<Event> = writable(null);

// TODO Move into observable prefs?
export let selectedDate = writable(new Date());
export type DateInterval = 1 | 2 | 7 | 31 | 28;
export let selectedDateInterval = writable(2 as DateInterval);
export let selectedCalendar = writable<Calendar | null>(null);
