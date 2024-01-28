<grid flex class="week-view" columns={showDays}>
  <hbox />
  {#each days as day}
    <vbox class="day-header">
      <hbox class="date">{day.toLocaleDateString(undefined, { day: "numeric" })}</hbox>
      <hbox class="weekday">{day.toLocaleDateString(undefined, { weekday: "long" })}</hbox>
    </vbox>
  {/each}
  {#each startTimes as start}
    <TimeLabel time={start} />
    <TimeDayRow {days} time={start} {events} />
  {/each}
</grid>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import TimeLabel from "./TimeLabel.svelte";
  import TimeDayRow from "./TimeDayRow.svelte";
  import type { Collection } from "svelte-collections";
  
  export let start: Date;
  export let events: Collection<Event>;
  export let showDays: 1 | 2 | 7 = 7; // If you add new options, adapt styles below
  export let showHours = 8;

  let startTimes: Date[] = [];
  $: start, setStartTimes();
  function setStartTimes() {
    let startTime = new Date(start);
    startTime.setHours(new Date().getHours()); // start with current hour
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    startTimes = [];
    for (let i = 0; i < showHours; i++) {
      startTimes.push(new Date(startTime));
      startTime.setHours(startTime.getHours() + 1)
    }
  }

  let days: Date[] = [];
  $: start, setDays();
  function setDays() {
    let startTime = new Date(start);
    if (showDays > 3) {
      startTime.setDate(startTime.getDate() - 1);
    }
    startTime.setHours(0);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    days = [];
    for (let i = 0; i < showDays; i++) {
      days.push(new Date(startTime));
      startTime.setDate(startTime.getDate() + 1)
    }
  }
</script>

<style>
  .week-view {
    display: grid;
    grid-template-rows: max-content;
    grid-auto-rows: 1fr;
  }
  .week-view[columns="1"] {
    grid-template-columns: max-content auto;
  }
  .week-view[columns="2"] {
    grid-template-columns: max-content 3fr 1fr;
  }
  .week-view[columns="7"] {
    grid-template-columns: max-content 0.33fr 3fr 2fr 1fr 1fr 1fr 1fr;
  }
  .day-header {
    padding: 16px;
    border-top: 1px dashed #E1E2E5;
    border-left: 1px dashed #E1E2E5;
    border-bottom: 1px dashed #E1E2E5;
  }
  .day-header .date {
    font-size: 200%;
  }
</style>
