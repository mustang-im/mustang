<hbox flex class="dual-view">
  <WeekView bind:start {events} showDays={2}/>
  <MonthView start={monthStart} {events} showDays={28} />
</hbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import type { Collection } from "svelte-collections";
  import WeekView from "./WeekView.svelte";
  import MonthView from "./MonthView.svelte";
  
  export let start: Date;
  export let events: Collection<Event>;

  let monthStart: Date;
</script>

<style>
</style>
