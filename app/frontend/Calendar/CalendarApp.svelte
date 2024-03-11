<vbox flex class="calendar-app">
  <TitleBar bind:dateInterval={$selectedDateInterval} on:addEvent={addEvent} />
  <Scroll>
    <vbox flex class="main">
      {#if dateInterval == 0 || $globalSearchTerm}
        <ListView {events} />
      {:else if dateInterval == 1}
        <WeekView bind:start={$selectedDate} {events} showDays={1} />
      {:else if dateInterval == 7}
        <WeekView bind:start={$selectedDate} {events} />
      {:else if dateInterval == 28}
        <MonthView bind:start={$selectedDate} {events} showDays={28} />
      {:else if dateInterval == 31}
        <MonthView bind:start={$selectedDate} {events} />
      {:else if dateInterval == 2}
        <DualView bind:start={$selectedDate} {events} />
      {:else}
        <WeekView bind:start={$selectedDate} {events} />
      {/if}
    </vbox>
  </Scroll>
</vbox>

<script lang="ts">
  import { Event } from "../../logic/Calendar/Event";
  import { selectedDate, selectedDateInterval } from "./selected";
  import { calendarMustangApp } from "./CalendarMustangApp";
  import { globalSearchTerm } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import TitleBar from "./TitleBar.svelte";
  import WeekView from "./WeekView.svelte";
  import MonthView from "./MonthView.svelte";
  import DualView from "./DualView.svelte";
  import ListView from "./ListView.svelte";
  import Scroll from "../Shared/Scroll.svelte";

  $: dateInterval = $selectedDateInterval;
  $: events = appGlobal.calendars.first.events.sortBy(ev => ev.startTime);

  function addEvent() {
    let event = new Event();
    event.startTime = new Date();
    event.endTime = new Date();
    calendarMustangApp.editEvent(event);
  }
</script>

<style>
  .main {
    margin: 32px;
  }
</style>
