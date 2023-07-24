<vbox class="events">
  {#if displayEvents && !displayEvents.isEmpty}
    {#each displayEvents as event (event.id)}
      <EventLine {event} />
    {/each}
  {/if}
</vbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import type { Collection } from "svelte-collections";
  import EventLine from "./EventLine.svelte";

  export let start: Date;
  export let intervalInHours: number;
  export let events: Collection<Event>;

  let end: Date;
  $: start, intervalInHours, setEnd();
  function setEnd() {
    end = new Date(start);
    end.setHours(end.getHours() + intervalInHours);
  }

  $: displayEvents = events.filter(ev => ev.startTime >= start && ev.endTime < end);
</script>

<style>
  .events {
    border-top: 1px dotted grey;
    border-left: 1px dotted grey;
  }
</style>
