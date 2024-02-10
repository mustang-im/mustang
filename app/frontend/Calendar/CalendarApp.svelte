<vbox flex class="calendar-app">
  {#if $editingEvent}
    <EditEvent event={$editingEvent} />
  {:else}
    <TitleBar bind:dateInterval={$selectedDateInterval} on:addEvent={addEvent} />
    <Scroll>
      <vbox flex class="main">
        {#if dateInterval == 1}
          <WeekView bind:start={$selectedDate} {events} showDays={1}/>
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
  {/if}
</vbox>

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import { selectedDate, selectedDateInterval, editingEvent } from "./selected";
  import TitleBar from "./TitleBar.svelte";
  import WeekView from "./WeekView.svelte";
  import MonthView from "./MonthView.svelte";
  import DualView from "./DualView.svelte";
  import EditEvent from "./EditEvent/EditEvent.svelte";
  import Scroll from "../Shared/Scroll.svelte";
  import { Event } from "../../logic/Calendar/Event";

  $: dateInterval = $selectedDateInterval;
  $: events = appGlobal.calendars.first.events.sortBy(ev => ev.startTime);

  function addEvent() {
    let event = new Event();
    event.startTime = new Date();
    event.endTime = new Date();
    $editingEvent = event;
  }
</script>

<style>
  .main {
    margin: 32px;
  }
</style>
