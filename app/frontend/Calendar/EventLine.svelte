<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="event" on:click={onSelect} on:dblclick={onOpen}>
  <!--{event.startTime.toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" })}-->
  {event.title}
</hbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import { editingEvent, selectedEvent } from "./selected";

  export let event: Event;

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
