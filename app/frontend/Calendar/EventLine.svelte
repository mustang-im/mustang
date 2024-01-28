<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="event" on:click={onSelect} on:dblclick={onOpen} title={eventAsText}>
  <!--{event.startTime.toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" })}-->
  {event.title}
</hbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import { editingEvent, selectedEvent } from "./selected";

  export let event: Event;

  $: eventAsText = `${event.startTime.toLocaleString(navigator.language, { hour: "2-digit", minute: "2-digit" })} – ${Math.ceil((event.endTime.getTime() - event.startTime.getTime()) / 1000 / 60)} min
${event.title}
${event.participants.hasItems ? event.participants.getIndexRange(0, 4).map(person => person.name).join(", "): ""}`;

  function onSelect() {
    $selectedEvent = event;
  }

  function onOpen() {
    $selectedEvent = event;
    $editingEvent = event;
  }
</script>

<style>
  .event {
    margin-bottom: 1px;
    padding: 4px;
    overflow: hidden;
    max-height: 1.4em;
    font-size: 13px;

    background-color: #20AF9E50;
    color: black;
  }
  .event:hover {
    background-color: #20AF9E70;
  }

  @media (prefers-color-scheme: dark) {
    .event {
      background-color: #ff7c0e;
      color: black;
    }
  }
</style>
