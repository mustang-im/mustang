<hbox class="event" on:click on:click={onSelect} on:dblclick={onOpen}
  title={eventAsText}
  class:selected={$selectedEvent == event}>
  {#if !event.allDay && !isContinued}
    <hbox class="time">
      <!--{event.startTime.toLocaleTimeString(getUILocale(), { hour: "numeric", minute: "numeric" })}-->
      {startTime}
    </hbox>
  {/if}
  <hbox class="title">{event.title}</hbox>
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

  $: startTime = event.startTime.toLocaleString(getUILocale(), { hour: "2-digit", minute: "2-digit" });
  $: eventAsText = (event.allDay ? "" : `${startTime} – ${getDurationString(event.endTime.getTime() - event.startTime.getTime())}\n`) +
     event.title +
     (event.participants.isEmpty ? "" : "\n" + event.participants.getIndexRange(0, 4).map(person => person.name).join(", "));
  $: isContinued = event.startTime < start;

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
    font-size: 14px;

    background-color: #20AF9E50;
    color: var(--fg);
  }
  .event:hover {
    background-color: #20AF9E70;
  }
  .time {
    margin-inline-end: 4px;
    font-weight: 600;
  }
</style>
