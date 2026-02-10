{#each startTimes as start}
  <TimeCell {start} {events} {overlayEvents} intervalInHours={1} on:celldblclick>
    <slot name="event-overlay" slot="event-overlay" let:start {start} let:end {end} let:event {event} let:events {events} />
    <slot name="event-hover" slot="event-hover" let:start {start} let:end {end} let:empty {empty} let:events {events} />
  </TimeCell>
{/each}

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import TimeCell from "./TimeCell.svelte";
  import type { Collection } from "svelte-collections";

  export let days: Date[];
  export let time: Date;
  export let events: Collection<Event>;
  export let overlayEvents: Collection<Event> | null = null;

  let startTimes: Date[] = [];
  $: days, time, setStartTimes();
  function setStartTimes() {
    startTimes = [];
    for (let day of days) {
      let startTime = new Date(day);
      startTime.setHours(time.getHours(), 0, 0, 0);
      startTimes.push(startTime);
    }
  }
</script>

<style>
</style>
