import { Event, RecurrenceCase } from "./Event";
import { mergeColls, ArrayColl } from "svelte-collections";

export function recurrenceColl(events: ArrayColl<Event>) {
  return mergeColls(events.map(mapToEvents));
}

function mapToEvents(event: Event): ArrayColl<Event> {
  if (event.recurrenceCase == RecurrenceCase.Master) {
    return event.instances;
  } else {
    return new ArrayColl([event]);
  }
}
