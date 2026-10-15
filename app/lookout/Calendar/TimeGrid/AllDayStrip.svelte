<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="all-day-strip"
  style="grid-column: {firstColumn} / span {days.length}; --days: {days.length}; --lanes: {Math.max($layout.lanes, 1)}"
  on:dblclick={onDoubleClick}
  on:contextmenu={onContextMenu}
  on:click={onClick}
  bind:this={stripEl}>
  {#each days as day, i}
    <div class="day drop-day" style="grid-column: {i + 1}" data-day-index={i} data-group={group}
      class:selected={isSelected(day, $selectedSlots)}>
      {#if isSelected(day, $selectedSlots) && day.getTime() == $selectedSlots.start.getTime()}
        <InlineEventTitle />
      {/if}
    </div>
  {/each}
  {#each $layout.events as item (item.event)}
    <div class="item" style="grid-column: {item.startDay + 1} / {item.endDay + 1}; grid-row: {item.lane + 1}">
      <EventBar event={item.event} variant="all-day"
        continuesBefore={item.continuesBefore} continuesAfter={item.continuesAfter} />
    </div>
  {/each}
</div>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import { layoutDayRow } from "../../../frontend/Calendar/MonthView/WeekRow";
  import { CalendarActions } from "../CalendarActions";
  import { DayAtPoint } from "../View/DayAtPoint";
  import { selectedSlots, eventPeek, kCalendarMenus, type CalendarMenus, type SlotSelection } from "../Selected";
  import { selectedEvent } from "../../../frontend/Calendar/selected";
  import { catchErrors } from "../../../frontend/Util/error";
  import EventBar from "../Event/EventBar.svelte";
  import InlineEventTitle from "../View/InlineEventTitle.svelte";
  import type { Collection } from "svelte-collections";
  import { derived } from "svelte/store";
  import { getContext } from "svelte";

  export let days: Date[];
  export let firstColumn: number;
  export let events: Collection<Event>;
  export let calendar: Calendar | null;
  export let group: number;

  const menus = getContext<CalendarMenus>(kCalendarMenus);

  let stripEl: HTMLDivElement;

  $: layout = derived([...$events.contents], allDayEvents => layoutDayRow(allDayEvents, days));

  function dayAt(clientX: number): Date {
    return DayAtPoint.find(stripEl, clientX, days);
  }

  function selectDay(day: Date) {
    CalendarActions.commitInlineTitle();
    $selectedEvent = null;
    $eventPeek = null;
    $selectedSlots = {
      start: day,
      end: new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1),
      allDay: true,
      calendar,
    };
  }

  function isSelected(day: Date, selection: SlotSelection | null): boolean {
    return !!selection && selection.allDay && selection.calendar == calendar &&
      selection.start <= day && day < selection.end;
  }

  function onClick(mouseEvent: MouseEvent) {
    selectDay(dayAt(mouseEvent.clientX));
  }

  function onDoubleClick(mouseEvent: MouseEvent) {
    let day = dayAt(mouseEvent.clientX);
    selectDay(day);
    catchErrors(() => CalendarActions.newEvent(calendar, day, null, "all-day"));
  }

  function onContextMenu(mouseEvent: MouseEvent) {
    mouseEvent.preventDefault();
    selectDay(dayAt(mouseEvent.clientX));
    menus.openSlotMenu(mouseEvent, $selectedSlots);
  }
</script>

<style>
  .all-day-strip {
    display: grid;
    grid-template-columns: repeat(var(--days), minmax(0, 1fr));
    grid-template-rows: repeat(var(--lanes), 22px);
    grid-row: 1;
    min-height: 24px;
    max-height: calc(3 * 22px + 6px);
    overflow-y: auto;
    padding-block-end: 2px;
    border-block-end: 1px solid var(--lo-border);
  }
  .day {
    position: relative;
    grid-row: 1 / -1;
    border-inline-start: 1px solid var(--lo-divider);
  }
  .day:global(.drop-target) {
    outline: 2px dashed var(--lo-accent);
    outline-offset: -2px;
  }
  .day.selected {
    background-color: color-mix(in srgb, var(--lo-accent) 22%, transparent);
  }
  .item {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 1px 3px 1px 2px;
    z-index: 1;
  }
</style>
