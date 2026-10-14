<Clickable onClick={onSelect} onDoubleClick={onOpen}>
  <hbox class="event font-small" flex
    title={eventAsText}>
    {#if showTime}
      <!--{event.startTime.toLocaleTimeString(getDateTimeLocale(), { hour: "numeric", minute: "numeric" })}-->
      <hbox class="time">{startTime}</hbox>
    {/if}
    <hbox class="title">{$event.title}</hbox>
  </hbox>
</Clickable>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { openEvent } from "../open";
  import { selectedEvent } from "../selected";
  import Clickable from "../../Shared/Clickable.svelte";
  import { getDurationString } from "../../Util/date";
  import { getDateTimeLocale } from "../../../l10n/l10n";

  export let event: Event;
  export let showTime = true;

  $: startTime = $event.startTime.toLocaleString(getDateTimeLocale(), { hour: "numeric", minute: "2-digit" });
  $: eventAsText = ($event.allDay ? "" : `${startTime} – ${getDurationString(event.endTime.getTime() - event.startTime.getTime())}\n`) +
     event.title +
     (event.participants.isEmpty ? "" : "\n" + event.participants.getIndexRange(0, 4).map(person => person.name).join(", "));

  function onSelect(ev: MouseEvent) {
    $selectedEvent = event;
  }

  function onOpen(ev: MouseEvent) {
    openEvent(event, true);
  }
</script>

<style>
  .event {
    min-width: 0;
    overflow: hidden;
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
  .title {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :global(.cancelled) .time,
  :global(.cancelled) .title {
    text-decoration: line-through;
  }
</style>
