import { Event, RecurrenceCase } from "./Event";
import type { Collection } from "svelte-collections";

export function recurrenceColl(events: Collection<Event>) {
  return events.flatMap(mapToEvents);
}

function mapToEvents(event: Event): Event | Collection<Event> | null {
  if (event == null) {
    return null;
  } else if (event.recurrenceCase == RecurrenceCase.Master) {
    return event.instances;
  } else {
    return event;
  }
}
