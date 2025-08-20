<SplitterBidirectional horizontal={$appGlobal.isSmall} initialSecondRatio={1} firstMinPx={200} secondMinPx={200}>
  <WeekView bind:start={$selectedDate} {events} showDays={2} slot="first">
    <slot name="top-left" slot="top-left" />
  </WeekView>
  <MonthView {start} {events} showDays={35} slot="second">
    <slot name="top-right" slot="top-right" />
  </MonthView>
</SplitterBidirectional>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import type { Collection } from "svelte-collections";
  import { selectedDate } from "./selected";
  import { appGlobal } from "../../logic/app";
  import WeekView from "./DayView/WeekView.svelte";
  import MonthView from "./MonthView/MonthView.svelte";
  import SplitterBidirectional from "../Shared/SplitterBidirectional.svelte";

  export let start: Date;
  export let events: Collection<Event>;
</script>
