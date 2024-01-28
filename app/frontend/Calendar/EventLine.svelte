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
    background-color: #ff7c0e;
    color: black;
    margin-bottom: 1px;
    /*box-shadow: 1px 1px 4px 0px grey;*/
    padding: 4px;
    overflow: hidden;
    max-height: 1.4em;
    font-size: 13px;
  }

  @media (prefers-color-scheme: light) {
    .event {
      background-color: #20AF9E50;
      color: black;
    }
  }
</style>
