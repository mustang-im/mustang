import { Event, RecurrenceCase } from "./Event";
import { mergeColls, ArrayColl } from "svelte-collections";

export function recurrenceColl(events: ArrayColl<Event>) {
  return mergeColls(events.map(event => event.instances));
}
