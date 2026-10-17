<div class="schedule-event lo-event status-{look.status}"
  class:past={look.isPast($now)}
  class:selected={$selectedEvent == event}
  class:continues-before={item.continuesBefore}
  class:continues-after={item.continuesAfter}
  style="left: {item.startMinute * pxPerMinute}px; width: {Math.max((item.endMinute - item.startMinute) * pxPerMinute - 2, 6)}px; top: {top}px; height: {height}px; --event-color: {look.color ?? "var(--lo-accent)"}"
  title={tooltip}
  role="button"
  tabindex="0"
  aria-label={tooltip}
  on:click={onClick}
  on:dblclick={onDoubleClick}
  on:contextmenu={onContextMenu}
  on:keydown={onKeyDown}
  on:focus={select}
  on:pointerdown={onPointerDown}
  bind:this={element}>
  <div class="lo-event-bar" />
  <div class="content">
    <span class="lo-event-title">{look.title}</span>
    {#if $event.location}
      <span class="location">{$event.location}</span>
    {/if}
    <EventIcons {look} />
  </div>
</div>

<script lang="ts">
  import type { ScheduleItem } from "./ScheduleLayout";
  import { EventLook } from "../Event/EventLook";
  import { CalendarActions } from "../CalendarActions";
  import { openEvent } from "../../../frontend/Calendar/open";
  import { catchErrors } from "../../../frontend/Util/error";
  import { now, kCalendarMenus, eventPeek, selectedSlots, type CalendarMenus } from "../selected";
  import { selectedEvent } from "../../../frontend/Calendar/selected";
  import EventIcons from "../DisplayEvent/EventIcons.svelte";
  import "../Event/EventLook.css";
  import { getDateTimeLocale } from "../../../l10n/l10n";
  import { getContext } from "svelte";

  export let item: ScheduleItem;
  export let pxPerMinute: number;
  export let top: number;
  export let height: number;

  const menus = getContext<CalendarMenus>(kCalendarMenus);
  let element: HTMLElement;

  $: event = item.event;
  $: calendar = $event.calendar;
  $: look = new EventLook($event, $calendar);
  $: tooltip = look.tooltip(getDateTimeLocale());

  // <copied from="../DayView/EventContainer.svelte">, without dragging
  function select() {
    $selectedEvent = event;
    $selectedSlots = null;
  }

  function onClick(mouseEvent: MouseEvent) {
    mouseEvent.stopPropagation();
    select();
    $eventPeek = { event, anchor: element };
  }

  function onDoubleClick(mouseEvent: MouseEvent) {
    mouseEvent.stopPropagation();
    $eventPeek = null;
    catchErrors(() => openEvent(event, true));
  }

  function onContextMenu(mouseEvent: MouseEvent) {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    select();
    $eventPeek = null;
    menus.openEventMenu(mouseEvent, event);
  }

  function onKeyDown(keyEvent: KeyboardEvent) {
    if (keyEvent.key == "Enter") {
      keyEvent.preventDefault();
      keyEvent.stopPropagation();
      $eventPeek = null;
      catchErrors(() => openEvent(event, true));
    } else if (keyEvent.key == " ") {
      keyEvent.preventDefault();
      select();
      $eventPeek = { event, anchor: element };
    }
  }

  function onPointerDown(pointerEvent: PointerEvent) {
    pointerEvent.stopPropagation();
    CalendarActions.commitInlineTitle();
  }
  // </copied>
</script>

<style>
  .schedule-event {
    position: absolute;
    z-index: 2;
    align-items: stretch;
    /* "hidden" would make the event the scroll container of the sticky title */
    overflow: clip;
  }
  .schedule-event.selected,
  .schedule-event:focus-visible {
    z-index: 4;
  }
  .schedule-event.continues-before {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .schedule-event.continues-after {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .content {
    position: sticky;
    left: var(--name-width);
    display: flex;
    align-items: center;
    flex: 0 1 auto;
    gap: 6px;
    min-width: 0;
    padding: 0 4px 0 5px;
  }
  .lo-event-title {
    flex: 0 1 auto;
  }
  .location {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--lo-fg-secondary);
  }
</style>
