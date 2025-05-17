<vbox flex class="events" on:click={onClick} on:dblclick={onDlbClick}>
  {#if displayEvents && !displayEvents.isEmpty}
    {#each displayEvents.each as event (event.id)}
      <EventBlock {event} {start} {end} otherEvents={events} />
    {/each}
  {/if}
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import EventBlock from "./EventBlock.svelte";
  import type { Collection } from "svelte-collections";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ dayClicked: Date, dayDblClicked: Date }>();

  export let start: Date;
  export let intervalInHours: number;
  export let events: Collection<Event>;

  let displayEvents: Collection<Event>;
  let end: Date;
  $: start, intervalInHours, setEnd();
  function setEnd() {
    end = new Date(start);
    end.setHours(end.getHours() + intervalInHours);
    displayEvents = events.filter(ev => ev.startTime < end && ev.endTime > start && !ev.allDay);
  }

  function onClick() {
    dispatchEvent("dayClicked", start);
  }

  function onDlbClick() {
    dispatchEvent("dayDblClicked", start);
  }
</script>

<style>
  .events {
    position: relative;
    border-left: 1px dotted var(--border);
    /* border-bottom: 1px dotted var(--border); /* should not make gap between cells */
    /* box-shadow: 0 1px 0 0 var(--border); */
    background-image: linear-gradient(to right, var(--border) 0%, rgba(255,255,255,0) 100%);
    background-position: bottom;
    background-size: 3px 1px;
    background-repeat: repeat-x;
  }
  .events :global(.event) {
    z-index: 1;
  }
</style>
