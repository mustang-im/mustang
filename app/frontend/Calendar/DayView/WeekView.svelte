<vbox class="week-view" flex>
  <hbox class="range-header">
    <slot name="top-left" />
    <hbox flex />
    <slot name="top-center">
      <DateRange bind:date={start} dateInterval={showDays == 2 ? 1 : showDays} />
      <Button classes="today-button" label={$t`Go back to today`} icon={TodayIcon} on:click={goToToday} iconSize="16px" plain iconOnly />
    </slot>
    <slot name="top-center" />
    <hbox flex />
    <slot name="top-right" />
  </hbox>
  <DayViewGrid {start} {events} {showDays} {showHours} {defaultFocusHour} />
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { getToday } from "../../Util/date";
  import DayViewGrid from "./DayViewGrid.svelte";
  import DateRange from "../DateRange.svelte";
  import Button from "../../Shared/Button.svelte";
  import TodayIcon from "lucide-svelte/icons/home";
  import type { Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let start: Date;
  export let events: Collection<Event>;
  export let showDays: 1 | 2 | 7 = 7; // If you add new options, adapt styles below
  /* Number of hours visible at the same time. Larger range reduces size per hour.
   * Other hours are available on scroll. */
  export let showHours = 10;
  export let defaultFocusHour = 8;

  function goToToday() {
    start = getToday();
  }
</script>

<style>
  .range-header {
    align-items: center;
  }
  .range-header :global(.today-button) {
    align-self: end;
    margin-block-end: 8px;
  }
</style>
