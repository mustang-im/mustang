<hbox class="event font-small" on:click on:click={onSelect} on:dblclick={onOpen}
  title={eventAsText}
  style="--account-color: {event.calendar?.color}"
  class:selected={$selectedEvent == event}>
  <hbox class="title">{event.title}</hbox>
</hbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { calendarMustangApp } from "../CalendarMustangApp";
  import { selectedEvent } from "../selected";

  export let event: Event;
  /** Time where the cell (not the event) starts */
  export let start: Date;

  $: eventAsText = event.title;

  function onSelect() {
    $selectedEvent = event;
  }

  function onOpen() {
    $selectedEvent = event;
    calendarMustangApp.showEvent(event);
  }
</script>

<style>
  .event {
    position: relative;
    padding: 4px;
    margin: 2px 0px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

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
