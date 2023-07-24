<grid class="month-view">
  {#each weekDays as day}
    <hbox class="weekday">
      {day.toLocaleDateString(undefined, { weekday: "long" })}
    </hbox>
  {/each}
  {#each days as day}
    <vbox class="day">
      <DayLabel {day} />
      <EventsCell start={day} {events} intervalInHours={24} />
    </vbox>
  {/each}
</grid>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import DayLabel from "./DayLabel.svelte";
  import EventsCell from "./EventsCell.svelte";
  import type { Collection } from "svelte-collections";
  
  export let start: Date;
  export let events: Collection<Event>;
  export let showDays = 35;

  let days: Date[] = [];
  let weekDays: Date[] = [];
  $: start, setDays();
  function setDays() {
    weekDays = getWeekDays();
    let startTime = weekDays[0]; // Always start with Monday
    days = [];
    for (let i = 0; i < showDays; i++) {
      days.push(new Date(startTime));
      startTime.setDate(startTime.getDate() + 1)
    }
  }

  function getWeekDays() {
    let startTime = new Date(start);
    // Always start with Monday
    startTime.setDate(startTime.getDate() - startTime.getDay() + 1);
    startTime.setHours(0);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    let weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(new Date(startTime));
      startTime.setDate(startTime.getDate() + 1)
    }
    return weekDays;
  }
</script>

<style>
  .month-view {
    display: grid;
    grid-template-columns: auto auto auto auto auto auto auto;
    grid-template-rows: max-content;
    grid-auto-rows: auto;
    flex: 1 0 0;
    margin: 32px;
    border-bottom: 1px dotted grey;
    border-right: 1px dotted grey;
  }
  .weekday {
    border-top: 1px dotted grey;
    border-left: 1px dotted grey;
    padding: 4px 8px;
    background-color: blue;
    color: white;
  }
  .day {
    border-top: 1px dotted grey;
    border-left: 1px dotted grey;
  }
  .events {
    padding: 4px 8px;
  }
</style>
