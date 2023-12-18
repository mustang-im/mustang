import type { Event } from "./Event";
import { ArrayColl } from "svelte-collections";
import { Observable, notifyChangedProperty } from "../util/Observable";

export class Calendar extends Observable {
  readonly id: string;
  @notifyChangedProperty
  name: string;

  readonly events = new ArrayColl<Event>();

  constructor() {
    super();
    this.id = crypto.randomUUID();
  }
}
