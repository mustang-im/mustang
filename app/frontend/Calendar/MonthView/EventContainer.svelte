<hbox class="event font-small"
  style="grid-column: {item.startDay + 1} / {item.endDay + 1}; grid-row: {item.lane + 1}; --color: {$event.color ?? $event.calendar?.color}"
  class:all-day={$event.allDay}
  class:cancelled={$event.isCancelled}
  class:selected={$selectedEvent == event}>
  <EventContent {event} showTime={!$event.allDay && !item.continuesBefore} />
</hbox>

<script lang="ts">
  import type { EventInDayRow } from "./WeekRow";
  import { selectedEvent } from "../selected";
  import EventContent from "./EventContent.svelte";

  export let item: EventInDayRow;

  $: event = item.event;
</script>

<style>
  .event {
    position: relative;
    margin-block-end: 1px;
    margin-inline-start: 1px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .event.all-day {
    opacity: 85%;
  }
  .event.cancelled {
    opacity: 30%;
  }
</style>
