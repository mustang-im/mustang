<grid flex class="month-view">
  {#each weekDays as day}
    <hbox class="weekday">
      {day.toLocaleDateString(undefined, { weekday: "short" })}
    </hbox>
  {/each}
  {#each days as day}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <vbox class="day"
      class:selected={day.getTime() == $selectedShowDate.getTime()}
      on:click={selectDay(day)}
      >
      <DayLabel {day} />
      <EventsCell start={day} {events} intervalInHours={24}
        withMonthOnFirst={true} withMonthOnMonday={true} />
    </vbox>
  {/each}
</grid>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import DayLabel from "./DayLabel.svelte";
  import EventsCell from "./EventsCell.svelte";
  import type { Collection } from "svelte-collections";
  import { selectedShowDate } from "./selected";
  
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

  function selectDay(day: Date) {
    $selectedShowDate = day;
  }
</script>

<style>
  .month-view {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: max-content;
    grid-auto-rows: 1fr;
    border-right: 1px dashed #E1E2E5;
  }
  .weekday {
    border-top: 1px dashed #E1E2E5;
    border-left: 1px dashed #E1E2E5;
    border-bottom: 1px dashed #E1E2E5;
    padding: 4px 8px;
    color: #8B8B8B;
    opacity: 70%;
    letter-spacing: 0.378px;
    text-transform: uppercase;
    font-weight: 300;
  }
  .day.selected {
    background-color: #E9F5F4;
  }
  .day:hover:not(.selected) {
    background-color: #F1F9F8;
  }
</style>
