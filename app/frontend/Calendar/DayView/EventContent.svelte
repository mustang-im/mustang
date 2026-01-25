<hbox class="event font-small" flex
  on:click
  on:click={onSelect}
  on:dblclick={onOpen}
  title={eventAsText}>
  {#if showTime}
    <!--{event.startTime.toLocaleTimeString(getDateTimeFormatPref(), { hour: "numeric", minute: "numeric" })}-->
    <hbox class="time">{startTime}</hbox>
  {:else if forceShowText}
    <hbox class="time">…</hbox>
  {/if}
  {#if showTitle}
    <hbox class="title">{$event.title}</hbox>
  {/if}
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { openEventFromOtherApp } from "../open";
  import { selectedEvent } from "../selected";
  import { getDurationString } from "../../Util/date";
  import { getDateTimeFormatPref } from "../../../l10n/l10n";

  export let event: Event;
  export let start: Date;
  export let end: Date;
  export let forceShowText = false;

  $: startTime = $event.startTime.toLocaleString(getDateTimeFormatPref(), { hour: "numeric", minute: "2-digit" });
  $: eventAsText = ($event.allDay ? "" : `${startTime} – ${getDurationString(event.endTime.getTime() - event.startTime.getTime())}\n`) +
     event.title +
     (event.participants.isEmpty ? "" : "\n" + event.participants.getIndexRange(0, 4).map(person => person.name).join(", "));
  $: showTime = start <= $event.startTime && event.startTime < end || start.getHours() == 0;
  $: showTitle = showTime || forceShowText;

  function onSelect(ev: MouseEvent) {
    ev.stopPropagation();
    $selectedEvent = event;
  }

  function onOpen(ev: MouseEvent) {
    ev.stopPropagation();
    $selectedEvent = event;
    openEventFromOtherApp(event, true);
  }
</script>

<style>
  .event {
    background-color: var(--color);
    color: lch(from var(--color) calc((49.44 - l) * infinity) 0 0);
  }
  @media (prefers-color-scheme: dark) {
    .event {
      background-image:
        linear-gradient(var(--color), var(--color)),
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
    font-weight: 600;
  }
  .time,
  .title {
    margin-inline-start: 6px;
    margin-block-start: 5px;
  }
  :global(.cancelled) .time,
  :global(.cancelled) .title {
    text-decoration: line-through;
  }
</style>
