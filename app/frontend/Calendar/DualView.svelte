<SplitterEither firstMinPx={200} secondMinPx={200} initialSecondRatio={1} horizontal={$appGlobal.isSmall}>
  <WeekView bind:start={$selectedDate} {events} showDays={2} slot="first">
    <slot name="top-left" slot="top-left" />
  </WeekView>
  <MonthView {start} {events} showDays={35} slot="second">
    <slot name="top-right" slot="top-right" />
  </MonthView>
</SplitterEither>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import type { Collection } from "svelte-collections";
  import { selectedDate } from "./selected";
  import { appGlobal } from "../../logic/app";
  import WeekView from "./DayView/WeekView.svelte";
  import MonthView from "./MonthView/MonthView.svelte";
  import SplitterEither from "../Shared/SplitterEither.svelte";

  export let start: Date;
  export let events: Collection<Event>;
</script>
