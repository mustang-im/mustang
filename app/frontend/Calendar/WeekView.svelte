<vbox class="week-view" flex>
  <hbox class="range-header">
    <slot name="top-left" />
    <hbox flex />
    <DateRange bind:date={start} dateInterval={showDays == 2 ? 1 : showDays} />
    <Button classes="today-button" label="Go back to today" icon={TodayIcon} on:click={goToToday} iconSize="16px" plain iconOnly />
    <hbox flex />
    <slot name="top-right" />
  </hbox>
  <grid flex class="week" columns={showDays}>
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
</vbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import { getToday } from "../Util/date";
  import TimeLabel from "./TimeLabel.svelte";
  import TimeDayRow from "./TimeDayRow.svelte";
  import DateRange from "./DateRange.svelte";
  import Button from "../Shared/Button.svelte";
  import TodayIcon from "lucide-svelte/icons/home";
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

  function goToToday() {
    start = getToday();
  }
</script>

<style>
  .week {
    display: grid;
    grid-template-rows: max-content;
    grid-auto-rows: 1fr;
  }
  .week[columns="1"] {
    grid-template-columns: max-content auto;
  }
  .week[columns="2"] {
    grid-template-columns: max-content 3fr 1fr;
  }
  .week[columns="7"] {
    grid-template-columns: max-content 0.33fr 3fr 2fr 1fr 1fr 1fr 1fr;
  }
  .day-header {
    padding: 8px 16px;
    border-top: 1px dotted var(--border);
    border-left: 1px dotted var(--border);
    border-bottom: 1px dotted var(--border);
  }
  .day-header .date {
    font-size: 180%;
  }
  .weekday {
    margin-top: -4px;
    margin-bottom: 4px;
  }
  .range-header {
    align-items: center;
  }
  .range-header :global(.today-button) {
    align-self: end;
    margin-bottom: 8px;
  }
</style>
