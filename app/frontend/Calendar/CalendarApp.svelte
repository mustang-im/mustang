<vbox flex class="calendar-app">
  {#if $editingEvent}
    <EditEvent event={$editingEvent} />
  {:else}
    <TitleBar bind:dateInterval on:addEvent={addEvent} />
    <Scroll>
      <vbox flex class="main">
        {#if dateInterval == 1}
          <WeekView start={showDate} {events} showDays={1}/>
        {:else if dateInterval == 7}
          <WeekView start={showDate} {events} />
        {:else if dateInterval == 28}
          <MonthView start={showDate} {events} showDays={28} />
        {:else if dateInterval == 31}
          <MonthView start={showDate} {events} />
        {:else if dateInterval == 2}
          <DualView start={showDate} {events} />
        {:else}
          <WeekView start={showDate} {events} />
        {/if}
      </vbox>
    </Scroll>
  {/if}
</vbox>

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import { selectedShowDate, selectedDateInterval, editingEvent } from "./selected";
  import TitleBar from "./TitleBar.svelte";
  import WeekView from "./WeekView.svelte";
  import MonthView from "./MonthView.svelte";
  import DualView from "./DualView.svelte";
  import EditEvent from "./EditEvent/EditEvent.svelte";
  import Scroll from "../Shared/Scroll.svelte";

  $: showDate = $selectedShowDate;
  $: dateInterval = $selectedDateInterval;
  $: events = appGlobal.calendars.first.events.sortBy(ev => ev.startTime);

  function addEvent() {
    alert("add event");
  }
</script>

<style>
  .main {
    margin: 32px;
  }
</style>
