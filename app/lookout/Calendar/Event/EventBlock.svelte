<div class="event-block lo-event status-{look.status}"
  class:past={look.isPast($now)}
  class:selected={$selectedEvent == event}
  class:continues-before={item.continuesBefore}
  class:continues-after={item.continuesAfter}
  style="top: {top}px; height: {height}px; --lane: {item.lane}; --lanes: {item.lanes}; --event-color: {look.color ?? "var(--lo-accent)"}"
  title={tooltip}
  role="button"
  tabindex="0"
  aria-label={tooltip}
  use:EventInteraction.attach={{ event, menus, startDrag }}>
  <div class="lo-event-bar" />
  {#if $event.isEditable}
    <div class="resize-handle" data-mode="resize-start" class:hidden={item.continuesBefore} />
    <div class="resize-handle end" data-mode="resize-end" class:hidden={item.continuesAfter} />
  {/if}
  <div class="content">
    <div class="title-line">
      <span class="lo-event-title">{look.title}</span>
      {#if look.canJoin($now)}
        <a class="join" href={$event.onlineMeetingURL} target="_blank"
          on:click|stopPropagation on:dblclick|stopPropagation>
          {$t`Join`}
        </a>
      {/if}
      <EventIcons {look} />
    </div>
    {#if lines >= 2 && $event.location}
      <div class="line">{$event.location}</div>
    {/if}
    {#if lines >= 3 && look.organizerName}
      <div class="line">{look.organizerName}</div>
    {/if}
  </div>
</div>

<script lang="ts">
  import type { TimedEventItem } from "../TimeGrid/TimeColumnLayout";
  import { EventLook } from "./EventLook";
  import { EventInteraction } from "./EventInteraction";
  import { EventDrag, type EventDragMode } from "../TimeGrid/EventDrag";
  import { CurrentTime } from "../View/CurrentTime";
  import { kCalendarMenus, type CalendarMenus } from "../Selected";
  import { selectedEvent } from "../../../frontend/Calendar/selected";
  import EventIcons from "./EventIcons.svelte";
  import "./EventLook.css";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";
  import { getContext } from "svelte";

  export let item: TimedEventItem;
  export let pxPerMinute: number;
  export let snapMinutes: number;

  const menus = getContext<CalendarMenus>(kCalendarMenus);
  const now = CurrentTime.minute;

  $: event = item.event;
  $: look = new EventLook($event);
  $: tooltip = look.tooltip(getDateTimeLocale());
  $: top = item.startMinute * pxPerMinute;
  $: height = Math.max((item.endMinute - item.startMinute) * pxPerMinute - 1, 6);
  $: lines = Math.floor((height - 4) / 15);

  function startDrag(pointerEvent: PointerEvent): EventDrag | null {
    if (!event.isEditable) {
      return null;
    }
    let handle = (pointerEvent.target as HTMLElement).closest(".resize-handle") as HTMLElement;
    let mode = (handle?.dataset.mode ?? "move") as EventDragMode;
    if (mode == "move" && (item.continuesBefore || item.continuesAfter)) {
      return null;
    }
    return new EventDrag(event, mode, pointerEvent, pxPerMinute, snapMinutes);
  }
</script>

<style>
  .event-block {
    position: absolute;
    left: calc((100% - var(--click-margin)) * var(--lane) / var(--lanes));
    width: calc((100% - var(--click-margin)) / var(--lanes) - 1px);
    line-height: 15px;
    z-index: 2;
  }
  .event-block.selected,
  .event-block:focus-visible {
    z-index: 3;
  }
  .event-block.continues-before {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .event-block.continues-after {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .event-block:global(.dragging) {
    z-index: 5;
    opacity: 85%;
    box-shadow: var(--lo-shadow-popup);
    cursor: grabbing;
  }
  .resize-handle {
    position: absolute;
    top: -1px;
    inset-inline: 0;
    height: 5px;
    cursor: ns-resize;
    z-index: 1;
  }
  .resize-handle.end {
    top: auto;
    bottom: -1px;
  }
  .resize-handle.hidden {
    display: none;
  }
  .content {
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    min-width: 0;
    padding: 1px 4px 1px 5px;
  }
  .title-line {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }
  .line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .join {
    flex: none;
    padding: 0 6px;
    border: 1px solid var(--lo-border-strong);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    font-weight: 600;
    text-decoration: none;
    line-height: 16px;
  }
  .join:hover {
    background-color: var(--lo-hover-bg);
  }
</style>
