{#each startTimes as start}
  <EventsBlockCell {start} {events} intervalInHours={1} />
{/each}

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import EventsBlockCell from "./EventsBlockCell.svelte";
  import type { Collection } from "svelte-collections";

  export let days: Date[];
  export let time: Date;
  export let events: Collection<Event>;

  let startTimes: Date[] = [];
  $: days, time, setStartTimes();
  function setStartTimes() {
    startTimes = [];
    for (let day of days) {
      let startTime = new Date(day);
      startTime.setHours(time.getHours());
      startTime.setMinutes(0);
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);
      startTimes.push(startTime);
    }
  }
</script>

<style>
</style>
