<vbox flex class="month-grid" class:week-numbers={showWeekNumbers}>
  <div class="weekdays" bind:clientWidth={width}>
    {#if showWeekNumbers}
      <div class="week-number-head" />
    {/if}
    {#each range.weeks[0] as day}
      <div class="weekday">
        {day.toLocaleDateString(getDateTimeLocale(), { weekday: width >= 7 * 100 ? "long" : "short" })}
      </div>
    {/each}
  </div>
  {#each range.weeks as week, weekIndex (week[0].getTime())}
    <hbox flex class="week-row">
      {#if showWeekNumbers}
        <div class="week-number" title={$t`Week ${getWeekNumber(week[0])}`}>{getWeekNumber(week[0])}</div>
      {/if}
      <WeekRow days={week} {weekIndex} {range} events={inRange} {onOpenDay} />
    </hbox>
  {/each}
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { CalendarRange } from "../View/CalendarRange";
  import { getWeekNumber } from "../../Util/date";
  import WeekRow from "./WeekRow.svelte";
  import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
  import type { Collection } from "svelte-collections";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";

  export let range: CalendarRange;
  export let events: Collection<Event>;
  export let onOpenDay: (day: Date) => void;

  const weekNumbersSetting = getLocalStorage<boolean>("lookout.calendar.weekNumbers", false);
  $: showWeekNumbers = $weekNumbersSetting.value;

  let width = 1000;

  $: inRange = events.filterObservable(event => event.startTime < range.end && event.endTime > range.start);
</script>

<style>
  .month-grid {
    min-height: 0;
  }
  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
  .week-numbers .weekdays {
    grid-template-columns: 28px repeat(7, minmax(0, 1fr));
  }
  .weekday {
    padding: 6px 8px;
    border-inline-start: 1px solid var(--lo-divider);
    font-size: 13px;
    color: var(--lo-fg-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .week-row {
    min-height: 0;
  }
  .week-number {
    flex: none;
    width: 28px;
    padding-block-start: 4px;
    border-block-start: 1px solid var(--lo-divider);
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
    text-align: center;
  }
</style>
