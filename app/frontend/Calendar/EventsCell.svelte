<vbox flex class="events">
  {#if displayEvents && !displayEvents.isEmpty}
    <Scroll>
      {#each displayEvents.each as event (event.id)}
        <EventLine {event} />
      {/each}
    </Scroll>
  {/if}
  {#if withMonthOnFirst && start.getDate() == 1 ||
    withMonthOnMonday && start.getDay() == 1 }
    <hbox class="month-name">
      {start.toLocaleDateString(getUILocale(), { month: "long" })}
    </hbox>
  {/if}
</vbox>

<script lang="ts">
  import type { Collection } from "svelte-collections";
  import type { Event } from "../../logic/Calendar/Event";
  import Scroll from "../Shared/Scroll.svelte";
  import EventLine from "./EventLine.svelte";
  import { getUILocale } from "../../l10n/l10n";

  export let start: Date;
  export let intervalInHours: number;
  export let events: Collection<Event>;
  export let withMonthOnFirst = false;
  export let withMonthOnMonday = false;

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
  .events {
    position: relative;
    border-left: 1px dotted var(--border);
    border-bottom: 1px dotted var(--border);
  }
  .month-name {
    position: absolute;
    bottom: 0px;
    left: 0px;
    overflow: hidden;
    z-index: 0;

    width: 100%;
    aspect-ratio: 1/1;
    margin-block-end: 8px;
    transform: rotate(270deg);

    color: #8B8B8B;
    opacity: 50%;
    letter-spacing: 0.378px;
    font-size: 16px;
    text-transform: uppercase;
    font-weight: 300;
  }
  .events :global(.event) {
    z-index: 1;
  }
</style>
