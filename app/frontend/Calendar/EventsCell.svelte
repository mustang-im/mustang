<vbox flex class="events">
  {#if displayEvents && !displayEvents.isEmpty}
    <Scroll>
      {#each displayEvents.each as event (event.id)}
        <EventLine {event} />
      {/each}
    </Scroll>
  {/if}
</vbox>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { Event } from "../../logic/Calendar/Event";
  import Scroll from "../Shared/Scroll.svelte";
  import EventLine from "./EventLine.svelte";

  export let start: Date;
  export let intervalInHours: number;
  export let events: Collection<Event>;

  let displayEvents: Collection<Event>;
  let end: Date;
  $: start, intervalInHours, setEnd();
  function setEnd() {
    end = new Date(start);
    end.setHours(end.getHours() + intervalInHours);
    displayEvents = events.filter(ev => ev.startTime >= start && ev.endTime < end);
  }
</script>

<style>
</style>
