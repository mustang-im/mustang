<vbox flex class="events" on:click={selectDay} on:dblclick={addEvent}>
  {#if $displayEvents?.hasItems}
    <Scroll>
      {#each $displayEvents.each as event (event.id)}
        {#if event.startTime && event.endTime}
          <EventContainer {event} {start} />
        {/if}
      {/each}
    </Scroll>
  {/if}
  {#if withMonthOnFirst && start.getDate() == 1 ||
    withMonthOnMonday && start.getDay() == 1 }
    <hbox class="month-name font-normal">
      {start.toLocaleDateString(getDateTimeFormatPref(), { month: "long" })}
    </hbox>
  {/if}
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { setNewEventTime } from "../event";
  import { selectedCalendar, selectedDate } from "../selected";
  import { openEventFromOtherApp } from "../open";
  import { appGlobal } from "../../../logic/app";
  import EventContainer from "./EventContainer.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import { k1HourMS } from "../../Util/date";
  import { assert } from "../../../logic/util/util";
  import { getDateTimeFormatPref, t } from "../../../l10n/l10n";
  import type { Collection } from "svelte-collections";

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
    displayEvents = events.filterObservable(ev => ev.startTime < end && ev.endTime > start);
  }

  function selectDay() {
    $selectedDate = start;
  }

  function addEvent() {
    $selectedCalendar ??= appGlobal.calendars.first;
    assert($selectedCalendar, $t`Please set up a calendar first`);
    let event = $selectedCalendar.newEvent();
    let startTime = new Date(start.getTime() + 10 * k1HourMS);
    setNewEventTime(event, true, startTime);
    openEventFromOtherApp(event, true);
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
    z-index: -1;

    width: 100%;
    aspect-ratio: 1/1;
    margin-block-end: 8px;
    transform: rotate(270deg);

    color: #8B8B8B;
    opacity: 50%;
    letter-spacing: 0.378px;
    text-transform: uppercase;
    font-weight: 300;
  }
  @container (max-height: 400px)  {
    .month-name {
      display: none;
    }
  }
</style>
