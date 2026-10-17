<div class="event-bar lo-event status-{look.status} {variant}"
  class:past={look.isPast($now)}
  class:selected={$selectedEvent == event}
  class:continues-before={continuesBefore}
  class:continues-after={continuesAfter}
  class:timed={showStartTime}
  style="--event-color: {look.color ?? "var(--lo-accent)"}"
  title={tooltip}
  role="button"
  tabindex="0"
  aria-label={tooltip}
  use:EventInteraction.attach={{ event, menus, startDrag }}>
  <div class="lo-event-bar" />
  <div class="content">
    {#if continuesBefore}
      <ContinuesBeforeIcon size="12" class="continues" />
    {/if}
    {#if showStartTime}
      <span class="time">{look.startTimeText(getDateTimeLocale())}</span>
    {/if}
    <span class="lo-event-title">{look.title}</span>
    <EventIcons {look} />
    {#if continuesAfter}
      <ContinuesAfterIcon size="12" class="continues" />
    {/if}
  </div>
</div>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { EventLook } from "../Event/EventLook";
  import { EventInteraction } from "../Event/EventInteraction";
  import { EventDrag } from "../EventDrag";
  import { now, kCalendarMenus, type CalendarMenus } from "../selected";
  import { selectedEvent } from "../../../frontend/Calendar/selected";
  import EventIcons from "../DisplayEvent/EventIcons.svelte";
  import ContinuesBeforeIcon from "lucide-svelte/icons/chevron-left";
  import ContinuesAfterIcon from "lucide-svelte/icons/chevron-right";
  import "../Event/EventLook.css";
  import { getDateTimeLocale } from "../../../l10n/l10n";
  import { getContext } from "svelte";

  export let event: Event;
  export let variant: "all-day" | "month";
  export let continuesBefore = false;
  export let continuesAfter = false;

  const menus = getContext<CalendarMenus>(kCalendarMenus);

  $: calendar = $event.calendar;
  $: look = new EventLook($event, $calendar);
  $: tooltip = look.tooltip(getDateTimeLocale());
  $: showStartTime = !$event.allDay && !continuesBefore;

  function startDrag(pointerEvent: PointerEvent): EventDrag | null {
    return event.isEditable ? new EventDrag(event, "move-days", pointerEvent) : null;
  }
</script>

<style>
  .event-bar {
    height: 20px;
    line-height: 18px;
  }
  .event-bar.continues-before {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .event-bar.continues-after {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .continues-before > :global(.lo-event-bar) {
    display: none;
  }
  .content {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    flex: 1 1 0;
    min-width: 0;
    padding: 0 4px 0 5px;
  }
  .all-day:not(.timed) .content {
    justify-content: center;
  }
  .all-day:not(.timed) .content :global(.lo-event-title) {
    flex: 0 1 auto;
  }
  .time {
    flex: none;
    color: var(--lo-fg-secondary);
  }
  .content :global(.continues) {
    flex: none;
    color: var(--lo-fg-secondary);
  }
</style>
