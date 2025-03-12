<hbox class="event" on:click on:click={onSelect} on:dblclick={onOpen}
  title={eventAsText}
  style="top: {startPosInPercent}%; height: {heightInPercent}%; --account-color: {event.calendar?.color}"
  class:selected={$selectedEvent == event}>
  {#if showLabel}
    <!--{event.startTime.toLocaleTimeString(getUILocale(), { hour: "numeric", minute: "numeric" })}-->
    <hbox class="time">{startTime}</hbox>
    <hbox class="title">{event.title}</hbox>
  {/if}
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
  /** Time where the cell (not the event) end */
  export let end: Date;

  $: startTime = event.startTime.toLocaleString(getUILocale(), { hour: "2-digit", minute: "2-digit" });
  $: eventAsText = (event.allDay ? "" : `${startTime} – ${getDurationString(event.endTime.getTime() - event.startTime.getTime())}\n`) +
     event.title +
     (event.participants.isEmpty ? "" : "\n" + event.participants.getIndexRange(0, 4).map(person => person.name).join(", "));
  $: heightInMS = end.getTime() - start.getTime();
  $: startPosInPercent = Math.max(0, (event.startTime.getTime() - start.getTime()) / heightInMS * 100);
  $: heightInPercent = Math.min(100, (event.endTime.getTime() - start.getTime()) / heightInMS * 100 - startPosInPercent);
  $: showLabel = start <= event.startTime && event.startTime < end || start.getHours() == 0;

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
    position: relative;
    padding: 4px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 14px;

    background-color: var(--account-color);
    color: lch(from var(--account-color) calc((49.44 - l) * infinity) 0 0);
  }
  @media (prefers-color-scheme: dark) {
    .event {
      background-image:
        linear-gradient(var(--account-color), var(--account-color)),
        linear-gradient(#000000BB, #000000BB);
      background-blend-mode: overlay;
      background-color: unset;
      color: unset;
    }
  }
  .event:hover {
    background-color: #20AF9E70;
  }
  .time {
    margin-inline-end: 4px;
    font-weight: 600;
  }
</style>
