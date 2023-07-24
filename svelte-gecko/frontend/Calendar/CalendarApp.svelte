<vbox class="app">
  <TitleBar bind:dateRange bind:dateInterval on:addEvent={addEvent} />
  <Scroll>
    {#if dateInterval == 1}
      <DayView start={dateRange} {events} />
    {:else if dateInterval == 7}
      <WeekView start={dateRange} {events} />
    {:else if dateInterval == 28}
      <Week4View start={dateRange} {events} />
    {:else if dateInterval == 31}
      <MonthView start={dateRange} {events} />
    {:else}
      <DayView start={dateRange} {events} />
    {/if}
  </Scroll>
</vbox>

<script lang="ts">
  import TitleBar from "./TitleBar.svelte";
  import DayView from "./DayView.svelte";
  import WeekView from "./WeekView.svelte";
  import Week4View from "./Week4View.svelte";
  import MonthView from "./MonthView.svelte";
  import Scroll from "../Shared/Scroll.svelte";
  import { appGlobal } from "../../logic/app";
  
  export let dateRange = new Date();
  export let dateInterval: 1 | 7 | 31 | 28 = 7;

  $: events = appGlobal.calendars.first.events.sortBy(ev => ev.startTime);

  function addEvent() {
    alert("add event");
  }
</script>

<style>
  .app {
    flex: 1 0 0;
  }
</style>
