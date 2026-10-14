<grid class="week-row">
  {#each days as day, i}
    <DayLabel {day} column={i + 1} />
  {/each}
  <grid class="lanes font-small"
    style="grid-template-rows: repeat({maxLanes}, var(--lane-height)) minmax(0, 1fr)"
    bind:this={lanesE}
    bind:clientHeight={lanesHeight}>
    {#each days as day, i}
      <DayCell start={day} column={i + 1} withMonthOnFirst={true} withMonthOnMonday={true} on:celldblclick />
    {/each}
    {#each limited.events as item (item.event)}
      <EventContainer {item} />
    {/each}
    {#each limited.hiddenEvents as hiddenEvents, i}
      {#if hiddenEvents.length}
        <MoreEvents day={days[i]} events={hiddenEvents} column={i + 1} row={maxLanes} />
      {/if}
    {/each}
  </grid>
</grid>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { layoutDayRow, limitLanes } from "./WeekRow";
  import DayLabel from "./DayLabel.svelte";
  import DayCell from "./DayCell.svelte";
  import EventContainer from "./EventContainer.svelte";
  import MoreEvents from "./MoreEvents.svelte";
  import type { Collection } from "svelte-collections";
  import { derived } from "svelte/store";

  export let days: Date[];
  export let events: Collection<Event>;

  let weekEvents: Collection<Event>;
  $: days, events, setWeek();
  function setWeek() {
    let weekStart = days[0];
    let weekEnd = new Date(days[days.length - 1]);
    weekEnd.setDate(weekEnd.getDate() + 1);
    weekEvents = events.filterObservable(ev => ev.startTime && ev.startTime < weekEnd && ev.endTime > weekStart);
  }

  $: layout = derived([...$weekEvents.contents], eventsInWeek => layoutDayRow(eventsInWeek, days));

  let lanesE: HTMLElement;
  let lanesHeight = 0;
  let maxLanes = 1;
  $: lanesE, lanesHeight, setMaxLanes();
  function setMaxLanes() {
    if (!lanesE) {
      return;
    }
    let laneHeight = parseFloat(getComputedStyle(lanesE).gridTemplateRows);
    maxLanes = Math.max(1, Math.floor(lanesHeight / laneHeight));
  }

  $: limited = limitLanes($layout, days.length, maxLanes);
</script>

<style>
  .week-row {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    grid-template-rows: max-content minmax(0, 1fr);
    overflow: hidden;
  }
  .lanes {
    grid-column: 1 / -1;
    grid-row: 2;
    display: grid;
    grid-template-columns: subgrid;
    overflow: hidden;
    --lane-height: calc(1.4em + 1px);
  }
</style>
