<hbox class="event font-small" on:click
  style="--color: {event.color ?? event.calendar?.color}"
  class:all-day={$event.allDay}
  class:cancelled={$event.isCancelled}
  class:selected={$selectedEvent == event}>
  <EventContent {event} {start} />
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { selectedEvent } from "../selected";
  import EventContent from "./EventContent.svelte";

  export let event: Event;
  /** Time where the cell (not the event) starts */
  export let start: Date;
</script>

<style>
  .event {
    margin-block-end: 1px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-height: 1.4em;
    min-height: 1.4em;
  }
  .event.all-day {
    opacity: 85%;
  }
  /* Gap between all-day events and time-based events */
  .event.all-day:has(+ :global(.event:not(.all-day))) {
    margin-block-end: 6px;
  }
  .event.cancelled {
    opacity: 30%;
  }
</style>
