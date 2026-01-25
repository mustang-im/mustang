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
    padding: 4px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-height: 1.4em;
    min-height: 1.4em;
  }
  .event.all-day {
    margin-block-end: 6px;
    padding: 0px 4px;
    opacity: 85%;
  }
  .event.cancelled {
    opacity: 30%;
  }
</style>
