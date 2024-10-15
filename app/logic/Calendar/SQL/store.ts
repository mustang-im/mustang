import { Calendar } from '../Calendar';
import { SQLCalendar } from './SQLCalendar';
import { SQLEvent } from './SQLEvent';
import { ArrayColl, Collection } from 'svelte-collections';

export async function readCalendars(): Promise<Collection<Calendar>> {
  let calendars = await SQLCalendar.readAll();
  for (let calendar of calendars) {
    SQLEvent.readAll(calendar);
  }
  if (calendars.isEmpty) {
    calendars.addAll(await createDefaultCalendars());
  }
  return calendars;
}

async function createDefaultCalendars(): Promise<Collection<Calendar>> {
  console.log("Creating default calendars");
  let calendars = new ArrayColl<Calendar>();
  let personal = new Calendar();
  personal.name = "Personal calendar";
  calendars.add(personal);
  await SQLCalendar.save(personal);
  return calendars;
}
