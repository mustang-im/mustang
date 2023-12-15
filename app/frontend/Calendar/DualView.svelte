<hbox flex class="dual-view">
  <WeekView {start} {events} showDays={2}/>
  <MonthView start={start} {events} showDays={28} />
</hbox>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import type { Collection } from "svelte-collections";
  import WeekView from "./WeekView.svelte";
  import MonthView from "./MonthView.svelte";
  
  export let start: Date;
  export let events: Collection<Event>;
</script>

<style>
</style>
