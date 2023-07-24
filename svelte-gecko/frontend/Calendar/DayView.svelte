<grid class="day-view">
  <hbox />
  <vbox class="day-header">
    <hbox class="date">{start.toLocaleDateString(undefined, { day: "numeric" })}</hbox>
    <hbox class="weekday">{start.toLocaleDateString(undefined, { weekday: "long" })}</hbox>
  </vbox>
  {#each startTimes as start}
    <TimeLabel time={start} />
    <EventsCell {start} {events} intervalInHours={1} />
  {/each}
</grid>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import TimeLabel from "./TimeLabel.svelte";
  import EventsCell from "./EventsCell.svelte";
  import type { Collection } from "svelte-collections";
  
  export let start: Date;
  export let events: Collection<Event>;

  let startTimes: Date[] = [];
  $: start, setStartTimes();
  function setStartTimes() {
    let startTime = new Date(start);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    startTimes = [];
    for (let i = 0; i < 8; i++) {
      startTimes.push(new Date(startTime));
      startTime.setHours(startTime.getHours() + 1)
    }
  }
</script>

<style>
  .day-view {
    display: grid;
    grid-template-columns: max-content auto;
    flex: 1 0 0;
    margin: 32px;
    border-bottom: 1px dotted grey;
    border-right: 1px dotted grey;
  }
  .day-header {
    padding: 16px;
    border-top: 1px dotted grey;
    border-left: 1px dotted grey;
  }
  .day-header .date {
    font-size: 200%;
  }
</style>
