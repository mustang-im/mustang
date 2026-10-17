<SplitterBidirectional horizontal={$appGlobal.isSmall} initialSecondRatio={1} firstMinPx={200} secondMinPx={200}>
  <vbox flex class="days" slot="first">
    <CalendarHeader range={daysRange} onToday={goToToday} onStep={stepDays} />
    <TimeGrid range={daysRange} {groups} {timeScale} enlargeSelectedDay={true}
      onOpenDay={selectDay} onOverlay={showOverlay} />
  </vbox>
  <vbox flex class="month" slot="second">
    <CalendarHeader range={monthRange} onStep={stepMonth}>
      <slot name="top-right" />
    </CalendarHeader>
    <MonthGrid range={monthRange} {events} {showWeekNumbers} onOpenDay={selectDay} />
  </vbox>
</SplitterBidirectional>

<script lang="ts">
  import type { Event } from "../../logic/Calendar/Event";
  import { CalendarSettings } from "./CalendarSettings";
  import { CalendarRange } from "./View/CalendarRange";
  import { eventPeek } from "./Selected";
  import { selectedDate } from "../../frontend/Calendar/selected";
  import { appGlobal } from "../../logic/app";
  import { getToday } from "../../frontend/Util/date";
  import CalendarHeader from "./View/CalendarHeader.svelte";
  import TimeGrid, { type CalendarColumnGroup } from "./TimeGrid/TimeGrid.svelte";
  import MonthGrid from "./Month/MonthGrid.svelte";
  import SplitterBidirectional from "../../frontend/Shared/SplitterBidirectional.svelte";
  import type { Collection } from "svelte-collections";

  export let start: Date;
  export let events: Collection<Event>;
  export let groups: CalendarColumnGroup[];
  export let timeScale: number;
  export let showWeekNumbers = false;

  $: daysRange = new CalendarRange("dual", $selectedDate);
  $: monthRange = new CalendarRange("month", start);

  function selectDay(day: Date) {
    $eventPeek = null;
    $selectedDate = day;
  }

  function goToToday() {
    selectDay(getToday());
    start = getToday();
  }

  function stepDays(direction: number) {
    selectDay(CalendarRange.step("dual", $selectedDate, 1, direction));
  }

  function stepMonth(direction: number) {
    $eventPeek = null;
    start = CalendarRange.step("month", start, 1, direction);
  }

  function showOverlay() {
    CalendarSettings.splitView.value = false;
  }
</script>

<style>
  .days,
  .month {
    min-width: 0;
    min-height: 0;
  }
</style>
