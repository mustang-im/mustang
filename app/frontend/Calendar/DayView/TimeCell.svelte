<vbox flex class="events"
  on:dblclick={onDoubleClick}
  on:pointerenter={() => hovering = true}
  on:pointerleave={() => hovering = false}
  >
  {#if $displayEvents?.hasItems}
    {#each $displayEvents.each as event (event.id)}
      <EventContainer {event} {start} {end} {conflicts}>
        <EventContent {event} {start} {end} forceShowText={conflicts.length > 1} />
      </EventContainer>
    {/each}
  {/if}

  {#if $displayOverlayEvents.hasItems}
    {#each $displayOverlayEvents.each as event}
      <EventContainer event={event} {start} {end} {conflicts}>
        <slot name="event-overlay" start={event.startTime} {end} events={displayEvents} />
      </EventContainer>
    {/each}
  {/if}

  {#if hovering}
    <slot name="event-hover"
      {start} {end}
      empty={!$displayEvents?.hasItems && !$displayOverlayEvents.hasItems}
      events={displayEvents}
      />
  {/if}
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import EventContainer from "./EventContainer.svelte";
  import { ArrayColl, Collection } from "svelte-collections";
  import EventContent from "./EventContent.svelte";
  import { createEventDispatcher } from 'svelte';
  const dispatchEvent = createEventDispatcher<{ celldblclick: { start: Date, end: Date } }>();

  export let start: Date;
  export let intervalInHours: number;
  export let events: Collection<Event>;
  export let overlayEvents: Collection<Event> | null = null;

  let displayEvents: ArrayColl<Event>;
  let displayOverlayEvents = new ArrayColl<Event>();
  let end: Date;
  $: start, intervalInHours, $overlayEvents, setEnd();
  function setEnd() {
    end = new Date(start);
    end.setHours(end.getHours() + intervalInHours);
    displayEvents = events.filterObservable(ev => ev.startTime < end && ev.endTime > start && !ev.allDay);
    displayOverlayEvents = overlayEvents
      ?.filterObservable(ev => ev.startTime < end && ev.endTime > start && !ev.allDay)
      ?? new ArrayColl<Event>();
  }

  $: conflicts = overlayEvents
        ? displayEvents.concat(displayOverlayEvents)
        : displayEvents;

  let hovering = false;

  function onDoubleClick(event: MouseEvent) {
    dispatchEvent("celldblclick", { start, end });
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
