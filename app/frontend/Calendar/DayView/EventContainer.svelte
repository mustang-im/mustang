<hbox class="event font-small" on:click
  style="
    top: {startPosInPercent}%;
    left: {conflicts.indexOf(event) / conflicts.length * 100}%;
    height: {heightInPercent}%;
    width: {100 / conflicts.length}%;
    --color: {event.color ?? event.calendar?.color}"
  class:conflict={conflicts.length > 1}
  class:cancelled={$event.isCancelled}
  class:selected={$selectedEvent == event}>
  <EventContent {event} {start} {end} forceShowText={conflicts.length > 1} />
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { selectedEvent } from "../selected";
  import EventContent from "./EventContent.svelte";
  import type { ArrayColl } from "svelte-collections";

  export let event: Event;
  /** Time where the cell (not the event) starts */
  export let start: Date;
  /** Time where the cell (not the event) end */
  export let end: Date;
  /** event and all other events that happen in this time slot */
  export let conflicts: ArrayColl<Event>;

  $: blockHeightInMS = end.getTime() - start.getTime();
  $: startPosInPercent = Math.max(0, ($event.startTime.getTime() - start.getTime()) / blockHeightInMS * 100);
  $: heightInPercent = Math.min(100, ($event.endTime.getTime() - start.getTime()) / blockHeightInMS * 100 - startPosInPercent);


  if (event) {
    console.log("cell day start", start.getDate() + ".", start.toLocaleTimeString(), "end", end.toLocaleTimeString(), "event",
      event.title + " start " + event.startTime.toLocaleTimeString() + " end " + event.endTime.toLocaleTimeString());
  }
</script>

<style>
  .event {
    position: absolute;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .event.conflict {
    margin-block-start: -4px;
    margin-inline-start: -2px;
    border: 2px solid red;
  }
  .event.cancelled {
    opacity: 30%;
  }
</style>
