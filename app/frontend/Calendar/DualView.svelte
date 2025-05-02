<hbox flex class="dual-view">
  {#if $selectedDate}
    <WeekView bind:start={$selectedDate} {events} showDays={2}>
      <slot name="top-left" slot="top-left" />
    </WeekView>
  {/if}
  <MonthView {start} {events} showDays={35}>
    <slot name="top-right" slot="top-right" />
  </MonthView>
</hbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import type { Collection } from "svelte-collections";
  import WeekView from "./DayView/WeekView.svelte";
  import MonthView from "./MonthView/MonthView.svelte";
  import { selectedDate } from "./selected";

  export let start: Date;
  export let events: Collection<Event>;
</script>

<style>
</style>
