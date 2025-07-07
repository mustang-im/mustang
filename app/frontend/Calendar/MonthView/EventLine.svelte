<hbox class="event font-small" on:click on:click={onSelect} on:dblclick={onOpen}
  title={eventAsText}
  style="--color: {event.color ?? event.calendar?.color}"
  class:all-day={$event.allDay}
  class:selected={$selectedEvent == event}>
  {#if !$event.allDay && !isContinued}
    <hbox class="time">
      <!--{event.startTime.toLocaleTimeString(getUILocale(), { hour: "numeric", minute: "numeric" })}-->
      {startTime}
    </hbox>
  {/if}
  <hbox class="title">{$event.title}</hbox>
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { calendarMustangApp } from "../CalendarMustangApp";
  import { selectedEvent } from "../selected";
  import { getDurationString } from "../../Util/date";
  import { getUILocale } from "../../../l10n/l10n";

  export let event: Event;
  /** Time where the cell (not the event) starts */
  export let start: Date;

  $: startTime = $event.startTime.toLocaleString(getUILocale(), { hour: "2-digit", minute: "2-digit" });
  $: eventAsText = ($event.allDay ? "" : `${startTime} – ${getDurationString(event.endTime.getTime() - event.startTime.getTime())}\n`) +
     event.title +
     (event.participants.isEmpty ? "" : "\n" + event.participants.getIndexRange(0, 4).map(person => person.name).join(", "));
  $: isContinued = $event.startTime < start;

  function onSelect() {
    $selectedEvent = event;
  }

  function onOpen() {
    $selectedEvent = event;
    calendarMustangApp.editEvent(event);
  }
</script>

<style>
  .event {
    margin-block-end: 1px;
    padding: 4px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-height: 1.4em;
    min-height: 1.4em;

    background-color: var(--color);
    color: lch(from var(--color) calc((49.44 - l) * infinity) 0 0);
  }
  @media (prefers-color-scheme: dark) {
    .event {
      background-image:
        linear-gradient(var(--color), var(--color)),
        linear-gradient(#000000AA, #000000AA);
      background-blend-mode: overlay;
      background-color: unset;
      color: unset;
    }
  }
  .event:hover {
    background-color: #20AF9E70;
  }
  .event.all-day {
    margin-block-end: 6px;
    padding: 0px 4px;
    opacity: 85%;
  }
  .time {
    margin-inline-end: 4px;
    font-weight: 600;
  }
</style>
