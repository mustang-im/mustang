<Clickable onClick={selectDay} {onDoubleClick}>
  <vbox flex class="events"
    style="--selected-calendar-color: {$selectedCalendar?.color ?? "black"}">
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
        {start.toLocaleDateString(getDateTimeLocale(), { month: "long" })}
      </hbox>
    {/if}
  </vbox>
</Clickable>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { selectedCalendar, selectedDate } from "../selected";
  import EventContainer from "./EventContainer.svelte";
  import Clickable from "../../Shared/Clickable.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import { k1HourMS } from "../../Util/date";
  import { getDateTimeLocale } from "../../../l10n/l10n";
  import { createEventDispatcher } from "svelte";
  import type { Collection } from "svelte-collections";
  const dispatchEvent = createEventDispatcher<{ celldblclick: { start: Date, mouseEvent: MouseEvent } }>();

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

  function onDoubleClick(mouseEvent: MouseEvent) {
    let startTime = new Date(start.getTime() + 10 * k1HourMS);
    dispatchEvent("celldblclick", { start: startTime, mouseEvent });
  }
</script>

<style>
  .events {
    position: relative;
    border-left: 1px dotted var(--border);
    border-bottom: 1px dotted var(--border);
  }
  .events:hover {
    background-color: color-mix(in srgb, var(--selected-calendar-color) 10%, transparent);
    color: white;
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
