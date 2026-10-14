<Clickable onClick={onSelect} onDoubleClick={onOpen}>
  <hbox class="event font-small"
    title={eventAsText}
    style="grid-column: {item.startDay + 1} / {item.endDay + 1}; grid-row: {item.lane + 1}; --account-color: {event.calendar?.color}"
    class:selected={$selectedEvent == event}>
    <hbox class="title">{event.title}</hbox>
  </hbox>
</Clickable>

<script lang="ts">
  import type { EventInDayRow } from "../MonthView/WeekRow";
  import Clickable from "../../Shared/Clickable.svelte";
  import { openEvent } from "../open";
  import { selectedEvent } from "../selected";

  export let item: EventInDayRow;

  $: event = item.event;
  $: eventAsText = event.title;

  function onSelect() {
    $selectedEvent = event;
  }

  function onOpen() {
    openEvent(event, true);
  }
</script>

<style>
  .event {
    position: relative;
    padding: 4px;
    margin-block-end: 1px;
    margin-inline-start: 1px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    opacity: 85%;

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
</style>
