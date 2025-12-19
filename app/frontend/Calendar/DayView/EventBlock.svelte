<hbox class="event font-small" on:click on:click={onSelect} on:dblclick={onOpen}
  title={eventAsText}
  style="
    top: {startPosInPercent}%;
    left: {conflicts.indexOf(event) / conflicts.length * 100}%;
    height: {heightInPercent}%;
    width: {100 / conflicts.length}%;
    --color: {event.color ?? event.calendar?.color}"
  class:conflict={conflicts.length > 1}
  class:cancelled={$event.isCancelled}
  class:selected={$selectedEvent == event}>
  {#if showTime}
    <!--{event.startTime.toLocaleTimeString(getDateTimeFormatPref(), { hour: "numeric", minute: "numeric" })}-->
    <hbox class="time">{startTime}</hbox>
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
  import type { ArrayColl } from "svelte-collections";

  export let event: Event;
  /** Time where the cell (not the event) starts */
  export let start: Date;
  /** Time where the cell (not the event) end */
  export let end: Date;
  /** event and all other events that happen in this time slot */
  export let conflicts: ArrayColl<Event>;

  $: startTime = $event.startTime.toLocaleString(getDateTimeFormatPref(), { hour: "2-digit", minute: "2-digit" });
  $: eventAsText = ($event.allDay ? "" : `${startTime} – ${getDurationString(event.endTime.getTime() - event.startTime.getTime())}\n`) +
     event.title +
     (event.participants.isEmpty ? "" : "\n" + event.participants.getIndexRange(0, 4).map(person => person.name).join(", "));
  $: blockHeightInMS = end.getTime() - start.getTime();
  $: startPosInPercent = Math.max(0, ($event.startTime.getTime() - start.getTime()) / blockHeightInMS * 100);
  $: heightInPercent = Math.min(100, ($event.endTime.getTime() - start.getTime()) / blockHeightInMS * 100 - startPosInPercent);
  /** Other events that run at the same time. Includes this event */
  $: showTime = start <= $event.startTime && event.startTime < end || start.getHours() == 0;
  $: showTitle = showTime || conflicts.length > 1;

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
    position: absolute;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

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
  .event.conflict {
    margin-block-start: -4px;
    margin-inline-start: -2px;
    border: 2px solid red;
  }
  .event.cancelled {
    opacity: 30%;
  }
  .time {
    font-weight: 600;
  }
  .time, .title {
    margin-inline-start: 6px;
    margin-block-start: 5px;
  }
  .cancelled .time,
  .cancelled .title {
    text-decoration: line-through;
  }
</style>
