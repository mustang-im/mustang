import { Event, RecurrenceCase } from "./Event";
import { Collection, concatColls } from "svelte-collections";

export function recurrenceColl(events: Collection<Event>) {
  return concatColls(events.map(mapToEvents));
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
