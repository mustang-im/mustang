<vbox flex class="events" on:click={selectDay} on:dblclick={addEvent}>
  {#if displayEvents && !displayEvents.isEmpty}
    {#each displayEvents.each as event (event.id)}
      <EventBlock {event} {start} {end} otherEvents={events} />
    {/each}
  {/if}
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { selectedCalendar, selectedDate } from "../selected";
  import { calendarMustangApp } from "../CalendarMustangApp";
  import EventBlock from "./EventBlock.svelte";
  import { assert } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";
  import type { Collection } from "svelte-collections";

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

  function selectDay() {
    $selectedDate = start;
  }

  function addEvent() {
    assert($selectedCalendar, $t`Please select a calendar first`);
    let event = $selectedCalendar.newEvent();
    event.startTime = new Date(start);
    event.endTime = new Date(start);
    calendarMustangApp.editEvent(event);
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
