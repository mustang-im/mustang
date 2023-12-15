import type { Event } from "./Event";
import { ArrayColl } from "svelte-collections";

export class Calendar {
  id: string;
  name: string;

  events = new ArrayColl<Event>();

  constructor() {
    this.id = crypto.randomUUID();
  }
}
