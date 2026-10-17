<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="month-week" style="--lines: {maxLines}" bind:clientHeight={height} bind:this={weekEl}
  on:click={onClick} on:dblclick={onDoubleClick} on:contextmenu={onContextMenu}>
  {#each days as day, i}
    <div class="cell drop-day" style="grid-column: {i + 1}" data-day-index={weekIndex * 7 + i}
      class:other-month={!range.isInMonth(day)}
      class:today={day.toDateString() == $now.toDateString()}
      class:selected={isSelected(day, $selectedSlots)}>
      <button class="add-button" title={$t`New appointment on this day`}
        on:click|stopPropagation={() => onAdd(day)} on:dblclick|stopPropagation>
        <AddIcon size="14" />
      </button>
      {#if isSelected(day, $selectedSlots) && day.getTime() == $selectedSlots.start.getTime()}
        <div class="inline-title-area">
          <InlineEventTitle />
        </div>
      {/if}
    </div>
    <button class="day-number" style="grid-column: {i + 1}"
      class:other-month={!range.isInMonth(day)}
      class:today={day.toDateString() == $now.toDateString()}
      class:first-of-month={day.getDate() == 1}
      title={day.toLocaleDateString(getDateTimeLocale(), { dateStyle: "full" })}
      on:click|stopPropagation={() => onOpenDay(day)}
      on:dblclick|stopPropagation>
      {day.getDate() == 1
        ? day.toLocaleDateString(getDateTimeLocale(), { month: "short", day: "numeric" })
        : day.toLocaleDateString(getDateTimeLocale(), { day: "numeric" })}
    </button>
  {/each}
  {#each $layout.shown as item (item.event)}
    <div class="item" style="grid-column: {item.startDay + 1} / {item.endDay + 1}; grid-row: {item.lane + 2}">
      <EventContainer event={item.event} variant="month"
        continuesBefore={item.continuesBefore} continuesAfter={item.continuesAfter} />
    </div>
  {/each}
  {#each $layout.hiddenCounts as hiddenCount, i}
    {#if hiddenCount}
      <button class="more" style="grid-column: {i + 1}; grid-row: {maxLines + 1}"
        on:click|stopPropagation={() => onOpenDay(days[i])}
        on:dblclick|stopPropagation>
        {$t`+${hiddenCount} more`}
      </button>
    {/if}
  {/each}
</div>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { CalendarRange } from "../View/CalendarRange";
  import { MonthWeekLayout } from "../Month/MonthWeekLayout";
  import { CalendarActions } from "../CalendarActions";
  import { DayAtPoint } from "../View/DayAtPoint";
  import { now, selectedSlots, eventPeek, kCalendarMenus, type CalendarMenus, type SlotSelection } from "../selected";
  import { selectedCalendar, selectedEvent, selectedDate } from "../../../frontend/Calendar/selected";
  import { catchErrors } from "../../../frontend/Util/error";
  import EventContainer from "./EventContainer.svelte";
  import InlineEventTitle from "../InlineEventTitle.svelte";
  import { WorkingHours } from "../View/WorkingHours";
  import AddIcon from "lucide-svelte/icons/circle-plus";
  import type { Collection } from "svelte-collections";
  import { derived } from "svelte/store";
  import { getContext } from "svelte";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";

  export let days: Date[];
  export let weekIndex: number;
  export let range: CalendarRange;
  export let events: Collection<Event>;
  export let onOpenDay: (day: Date) => void;

  const menus = getContext<CalendarMenus>(kCalendarMenus);
  const kHeaderHeight = 24;
  const kLineHeight = 22;

  let weekEl: HTMLDivElement;
  let height = 0;
  $: maxLines = Math.max(Math.floor((height - kHeaderHeight - 2) / kLineHeight), 1);

  let weekEvents: Collection<Event>;
  $: days, events, filterWeek();
  function filterWeek() {
    let weekStart = days[0];
    let lastDay = days[days.length - 1];
    let weekEnd = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + 1);
    weekEvents = events.filterObservable(event => event.startTime < weekEnd && event.endTime > weekStart);
  }
  $: layout = derived([...$weekEvents.contents], eventsInWeek => new MonthWeekLayout(eventsInWeek, days, maxLines));

  function dayAt(clientX: number): Date {
    return DayAtPoint.find(weekEl, clientX, days);
  }

  function selectDay(day: Date) {
    CalendarActions.commitInlineTitle();
    $selectedEvent = null;
    $eventPeek = null;
    $selectedDate = day;
    $selectedSlots = {
      start: day,
      end: new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1),
      allDay: true,
      calendar: null,
    };
  }

  function isSelected(day: Date, selection: SlotSelection | null): boolean {
    return !!selection && selection.allDay && selection.start <= day && day < selection.end;
  }

  function onClick(mouseEvent: MouseEvent) {
    selectDay(dayAt(mouseEvent.clientX));
  }

  function onDoubleClick(mouseEvent: MouseEvent) {
    let day = dayAt(mouseEvent.clientX);
    selectDay(day);
    catchErrors(() => CalendarActions.newEvent(null, day, null, "all-day"));
  }

  function onAdd(day: Date) {
    let start = WorkingHours.workStartOf($selectedCalendar, day);
    catchErrors(() => CalendarActions.newEvent(null, start, null));
  }

  function onContextMenu(mouseEvent: MouseEvent) {
    mouseEvent.preventDefault();
    let day = dayAt(mouseEvent.clientX);
    if (!isSelected(day, $selectedSlots)) {
      selectDay(day);
    }
    menus.openSlotMenu(mouseEvent, $selectedSlots);
  }
</script>

<style>
  .month-week {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-template-rows: 24px repeat(var(--lines), 22px) minmax(0, 1fr);
    flex: 1 1 0;
    min-height: 0;
    overflow: hidden;
    border-block-start: 1px solid var(--lo-divider);
  }
  .cell {
    grid-row: 1 / -1;
    position: relative;
    border-inline-start: 1px solid var(--lo-divider);
  }
  .add-button {
    position: absolute;
    top: 1px;
    inset-inline-end: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--lo-accent-text);
    cursor: pointer;
    opacity: 0;
    z-index: 2;
  }
  .cell:hover .add-button,
  .cell:has(+ .day-number:hover) .add-button,
  .add-button:focus-visible {
    opacity: 1;
  }
  .add-button:hover {
    background-color: var(--lo-hover-bg);
  }
  .inline-title-area {
    position: absolute;
    top: 24px;
    inset-inline: 0;
  }
  .cell:global(.drop-target) {
    outline: 2px dashed var(--lo-accent);
    outline-offset: -2px;
  }
  .cell.other-month {
    background-color: var(--lo-pane-alt-bg);
  }
  .cell.today {
    background-color: color-mix(in srgb, var(--lo-accent) 6%, var(--lo-pane-bg));
  }
  .cell.today::before {
    content: "";
    position: absolute;
    top: 0;
    inset-inline: 0;
    height: 3px;
    background-color: var(--lo-accent);
  }
  .cell.selected {
    background-color: color-mix(in srgb, var(--lo-accent) 16%, var(--lo-pane-bg));
  }
  .day-number {
    grid-row: 1;
    justify-self: start;
    align-self: center;
    margin-inline-start: 4px;
    padding: 0 4px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    z-index: 1;
  }
  .day-number:hover {
    background-color: var(--lo-hover-bg);
    text-decoration: underline;
  }
  .day-number.other-month {
    color: var(--lo-fg-secondary);
  }
  .day-number.first-of-month {
    font-weight: 600;
  }
  .day-number.today {
    color: var(--lo-accent-text);
    font-weight: 700;
  }
  .item {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 1px 3px 1px 2px;
    z-index: 1;
  }
  .more {
    justify-self: start;
    margin-inline-start: 4px;
    padding: 0 4px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-accent-text);
    font: inherit;
    font-size: var(--lo-font-size-small);
    font-weight: 600;
    cursor: pointer;
    z-index: 1;
  }
  .more:hover {
    background-color: var(--lo-hover-bg);
    text-decoration: underline;
  }
</style>
