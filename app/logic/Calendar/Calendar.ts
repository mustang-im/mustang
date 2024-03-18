import { Account } from "../Abstract/Account";
import type { Event } from "./Event";
import { ArrayColl } from "svelte-collections";

export class Calendar extends Account {
  readonly protocol = "calendar";
  readonly events = new ArrayColl<Event>();
}
