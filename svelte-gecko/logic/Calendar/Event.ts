import type { Person } from "../Abstract/Person";
import { ArrayColl } from "svelte-collections";

export class Event {
  id: string;
  title: string;
  descriptionText: string;
  descriptionHTML: string;

  startTime: Date;
  endTime: Date;
  allDay = false;

  location: string;
  onlineMeetingURL: string;
  participants = new ArrayColl<Person>();
  lastMod = new Date();

  constructor() {
    this.id = crypto.randomUUID();
  }
}
