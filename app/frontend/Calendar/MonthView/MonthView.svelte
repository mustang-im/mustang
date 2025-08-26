<vbox class="month-view" flex
  on:mousewheel={event => catchErrors(() => onScrollWheel(event))}>
  <hbox class="range-header">
    <slot name="top-left" />
    <hbox flex />
    <DateRange bind:date={start} dateInterval={showDays} />
    <hbox flex />
    <slot name="top-right" />
  </hbox>
  <grid flex class="month">
    {#each weekDays as day}
      <hbox class="weekday">
        {day.toLocaleDateString(getDateTimeFormatPref(), { weekday: "short" })}
      </hbox>
    {/each}
    {#each days as day}
      <vbox class="day"
        class:selected={day.getTime() == $selectedDate?.getTime()}
        >
        <DayLabel {day} />
        <EventsLineCell start={day} events={filteredEvents} intervalInHours={24}
          withMonthOnFirst={true} withMonthOnMonday={true} />
      </vbox>
    {/each}
  </grid>
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import DayLabel from "./DayLabel.svelte";
  import EventsLineCell from "./EventsLineCell.svelte";
  import DateRange from "../DateRange.svelte";
  import { selectedDate } from "../selected";
  import { getWeekDays } from "../../Util/date";
  import { catchErrors } from "../../Util/error";
  import { getDateTimeFormatPref } from "../../../l10n/l10n";
  import type { Collection } from "svelte-collections";

  export let start: Date;
  export let events: Collection<Event>;
  export let showDays = 35;

  let days: Date[] = [];
  let weekDays: Date[] = [];
  let filteredEvents: Collection<Event>;
  $: start, setDays();
  function setDays() {
    weekDays = getWeekDays(start);
    if (showDays == 35) {
      while (weekDays[6].getDate() > 7) {
        start.setDate(start.getDate() - 7);
        weekDays = getWeekDays(start);
      }
    }
    let startTime = weekDays[0]; // Always start with Monday
    let filterStart = new Date(startTime);
    days = [];
    for (let i = 0; i < showDays; i++) {
      days.push(new Date(startTime));
      startTime.setDate(startTime.getDate() + 1)
    }
    let filterEnd = startTime;
    filteredEvents = events.filterObservable(ev => ev.startTime && ev.startTime < filterEnd && filterStart < ev.endTime);
  }

  function onScrollWheel(event: WheelEvent) {
    const upDown = event.deltaY > 0 ? 1 : -1;
    start.setDate(start.getDate() + showDays * upDown);
    start = start;
  }
</script>

<style>
  grid.month {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: max-content;
    grid-auto-rows: 1fr;
    border-right: 1px dotted var(--border);
  }
  .weekday {
    border-top: 1px dotted var(--border);
    border-left: 1px dotted var(--border);
    border-bottom: 1px dotted var(--border);
    padding: 4px 8px;
    color: #8B8B8B;
    opacity: 70%;
    letter-spacing: 0.378px;
    text-transform: uppercase;
    font-weight: 300;
  }
  .day {
    overflow: hidden;
  }
  .day.selected {
    background-color: #E9F5F4;
  }
  .day:hover:not(.selected) {
    background-color: #F1F9F8;
  }
  @media (prefers-color-scheme: dark) {
    .day.selected {
      background-color: #193D39;
    }
    .day:hover:not(.selected) {
      background-color: var(--hover-bg);
      color: var(--hover-fg);
    }
    .day.selected:hover {
      background-color: var(--selected-hover-bg);
      color: var(--selected-hover-fg);
    }
  }
  .month-view :global(.date-range) {
    font-weight: bold;
  }
  .month-view :global(.date-range .year) {
    font-weight: normal;
  }
</style>
