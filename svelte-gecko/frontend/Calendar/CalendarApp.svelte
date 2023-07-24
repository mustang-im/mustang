<vbox class="app">
  <TitleBar bind:dateRange bind:dateInterval on:addEvent={addEvent} />
  <Scroll>
    {#if dateInterval == 1}
      <WeekView start={dateRange} {events} showDays={1}/>
    {:else if dateInterval == 7}
      <WeekView start={dateRange} {events} />
    {:else if dateInterval == 28}
      <MonthView start={dateRange} {events} showDays={28} />
    {:else if dateInterval == 31}
      <MonthView start={dateRange} {events} />
    {:else}
      <WeekView start={dateRange} {events} />
    {/if}
  </Scroll>
</vbox>

<script lang="ts">
  import TitleBar from "./TitleBar.svelte";
  import WeekView from "./WeekView.svelte";
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
