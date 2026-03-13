<hbox class="day">
  {startDay}
</hbox>
<hbox class="time">
  {#if !$event.allDay}
    {startTime}
  {/if}
</hbox>
<hbox class="event title"
  on:click
  on:click={onSelect}
  on:dblclick={onOpen}
  title={eventAsText}
  style="--color: {event.color ?? event.calendar?.color}"
  class:all-day={$event.allDay}
  class:selected={$selectedEvent == event}
  >
  {$event.title}
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { selectedEvent } from "../selected";
  import { openEventFromOtherApp } from "../open";
  import { getDurationString } from "../../Util/date";
  import { getDateTimeFormatPref } from "../../../l10n/l10n";

  export let event: Event;

  $: startDay = event.startTime.toLocaleString(getDateTimeFormatPref(), { day: "2-digit", month: "short" });
  $: startTime = event.startTime.toLocaleString(getDateTimeFormatPref(), { hour: "2-digit", minute: "2-digit" });
  $: eventAsText = (event.allDay ? "" : `${startTime} – ${getDurationString(event.endTime.getTime() - event.startTime.getTime())}\n`) +
     event.title +
     (event.participants.isEmpty ? "" : "\n" + event.participants.getIndexRange(0, 4).map(person => person.name).join(", "));

  function onSelect() {
    $selectedEvent = event;
  }

  function onOpen() {
    openEventFromOtherApp(event);
  }
</script>

<style>
  .event {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    background-color: var(--color);
  }
  @media (prefers-color-scheme: dark) {
    .event {
      background-image:
        linear-gradient(var(--color), var(--color)),
        linear-gradient(#000000AA, #000000AA);
      background-blend-mode: overlay;
      background-color: unset;
    }
  }
  .event:hover {
    background-color: #20AF9E70;
  }
  .event.all-day {
    opacity: 85%;
  }
  .time {
    font-weight: 600;
  }
</style>
