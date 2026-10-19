<grid class="day-column" style="grid-column: {column}">
  {#each offWorkPeriods as period}
    <hbox class="off-work" style="top: {position(period.start) * 100}%; bottom: {(1 - position(period.end)) * 100}%" />
  {/each}
  {#each hourStarts as start, i}
    <HourSlot {start} row={i * kRowsPerHour + 1} empty={isEmpty($layout, i * kRowsPerHour)} on:celldblclick>
      <slot name="event-hover" slot="event-hover" let:start {start} let:end {end} let:empty {empty} />
    </HourSlot>
  {/each}
  {#each $layout as item (item.event)}
    <EventContainer {item}>
      {#if $dayOverlayEvents.contains(item.event)}
        <slot name="event-overlay" start={item.event.startTime} end={item.event.endTime} event={item.event} />
      {:else}
        <EventContent event={item.event} showTime={!item.continuesBefore} />
      {/if}
    </EventContainer>
  {/each}
  <CurrentTimeMarker {day} {startHour} {endHour} />
</grid>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { WorkHours, type WorkPeriod } from "../../../logic/Calendar/WorkHours";
  import { layoutTimeColumn, kRowsPerHour, type EventInTimeColumn } from "./DayColumn";
  import HourSlot from "./HourSlot.svelte";
  import EventContainer from "./EventContainer.svelte";
  import EventContent from "./EventContent.svelte";
  import CurrentTimeMarker from "../CurrentTimeMarker.svelte";
  import { ArrayColl, type Collection } from "svelte-collections";
  import { derived } from "svelte/store";

  export let day: Date;
  export let column: number;
  export let events: Collection<Event>;
  export let overlayEvents: Collection<Event> | null = null;
  export let startHour = 0;
  export let endHour = 24;
  export let workHours: WorkHours[] = [];

  let hourStarts: Date[] = [];
  let dayStart: Date;
  let dayEnd: Date;
  $: dayEvents = events.filterObservable(isInDay);
  $: dayOverlayEvents = overlayEvents?.filterObservable(isInDay) ?? new ArrayColl<Event>();
  $: day, startHour, endHour, setDay();
  function setDay() {
    hourStarts = [];
    for (let hour = startHour; hour < endHour; hour++) {
      let hourStart = new Date(day);
      hourStart.setHours(hour, 0, 0, 0);
      hourStarts.push(hourStart);
    }
    dayStart = hourStarts[0];
    dayEnd = new Date(day);
    dayEnd.setHours(endHour, 0, 0, 0);
    dayEvents.replaceAll(events.contents.filter(isInDay));
    dayOverlayEvents.replaceAll(overlayEvents?.contents.filter(isInDay) ?? []);
  }

  function isInDay(ev: Event): boolean {
    return ev.startTime < dayEnd && ev.endTime > dayStart && !ev.allDay;
  }

  let offWorkPeriods: WorkPeriod[] = [];
  $: day, startHour, endHour, workHours, setOffWorkPeriods();
  function setOffWorkPeriods() {
    if (!workHours.length) {
      offWorkPeriods = [];
      return;
    }
    let dayStart = new Date(day);
    dayStart.setHours(startHour, 0, 0, 0);
    let dayEnd = new Date(day);
    dayEnd.setHours(endHour, 0, 0, 0);
    offWorkPeriods = WorkHours.offWorkPeriodsOfAll(workHours, dayStart, dayEnd);
  }

  function position(time: Date): number {
    if (time.getDate() != day.getDate()) {
      return time < day ? 0 : 1;
    }
    let hours = time.getHours() + time.getMinutes() / 60;
    return Math.min(Math.max((hours - startHour) / (endHour - startHour), 0), 1);
  }

  $: layout = derived(
    [...$dayEvents.contents, ...$dayOverlayEvents.contents],
    eventsInDay => layoutTimeColumn(eventsInDay, day, startHour, endHour));

  function isEmpty(layout: EventInTimeColumn[], row: number): boolean {
    return !layout.some(item => item.startRow < row + kRowsPerHour && item.endRow > row);
  }
</script>

<style>
  .day-column {
    grid-row: 3 / -1;
    display: grid;
    grid-template-rows: subgrid;
    grid-template-columns: minmax(0, 1fr);
    position: relative;
    border-left: 1px dotted var(--border);
  }
  .off-work {
    position: absolute;
    inset-inline: 0px;
    background-color: var(--calendar-off-work-bg);
    pointer-events: none;
  }
</style>
