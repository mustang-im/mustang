<vbox class="week-view" flex>
  <hbox class="range-header">
    <slot name="top-left" />
    <hbox flex />
    <slot name="top-center">
      <DateRange bind:date={start} dateInterval={showDays > 3 ? 7 : 1} {showDays} />
      <Button classes="today-button" label={$t`Go back to today`} icon={TodayIcon} onClick={goToToday} iconSize="16px" plain iconOnly />
    </slot>
    <slot name="top-center" />
    <hbox flex />
    <slot name="top-right" />
  </hbox>
  <DayViewGrid {start} {events} {showDays} {showHours} {defaultFocusHour} {enlargeSelectedDay}
    on:celldblclick={(param) => newEventMenu.openMenu(param.detail.mouseEvent, param.detail.start)} />
</vbox>

<NewEventMenu bind:this={newEventMenu} />

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { type DateInterval } from "../selected";
  import { getToday } from "../../Util/date";
  import DayViewGrid from "./DayViewGrid.svelte";
  import NewEventMenu from "../NewEventMenu.svelte";
  import DateRange from "../DateRange.svelte";
  import Button from "../../Shared/Button.svelte";
  import TodayIcon from "lucide-svelte/icons/home";
  import type { Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";

  export let start: Date;
  export let events: Collection<Event>;
  export let showDays: DateInterval;
  /* Number of hours visible at the same time. Larger range reduces size per hour.
   * Other hours are available on scroll. */
  export let showHours = 10;
  export let defaultFocusHour: number | null = null;
  export let enlargeSelectedDay = false;

  let newEventMenu: NewEventMenu;

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
