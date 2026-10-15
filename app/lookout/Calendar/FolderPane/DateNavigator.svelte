<vbox class="date-navigator" class:week-numbers={showWeekNumbers}>
  <hbox class="title-row">
    <button class="arrow" title={$t`Previous month`} on:click={() => month = month.next(-1)}>
      <PreviousIcon size="16" />
    </button>
    <hbox flex class="title">{month.title(getDateTimeLocale())}</hbox>
    <button class="arrow" title={$t`Next month`} on:click={() => month = month.next(1)}>
      <NextIcon size="16" />
    </button>
  </hbox>
  <div class="grid" role="grid" aria-label={month.title(getDateTimeLocale())}>
    {#if showWeekNumbers}
      <span class="weekday week-number">#</span>
    {/if}
    {#each month.weekdayLabels(getDateTimeLocale()) as label}
      <span class="weekday">{label}</span>
    {/each}
    {#each month.weeks as week}
      {#if showWeekNumbers}
        <span class="week-number">{WeekNumber.of(week[0])}</span>
      {/if}
      {#each week as day}
        {@const inRange = range.contains(day)}
        <button class="day"
          class:other-month={!month.isInMonth(day)}
          class:today={CurrentTime.isToday(day, $now)}
          class:in-range={inRange}
          class:range-start={inRange && !range.contains(dayBefore(day))}
          class:range-end={inRange && !range.contains(dayAfter(day))}
          class:has-events={daysWithEvents.has(DateNavigatorMonth.dayKey(day))}
          title={day.toLocaleDateString(getDateTimeLocale(), { dateStyle: "full" })}
          on:click={() => onSelectDay(day)}>
          <span class="number">{day.getDate()}</span>
        </button>
      {/each}
    {/each}
  </div>
</vbox>

<script lang="ts">
  import type { CalendarRange } from "../View/CalendarRange";
  import { DateNavigatorMonth } from "./DateNavigatorMonth";
  import { CurrentTime } from "../View/CurrentTime";
  import { WeekNumber } from "../View/WeekNumber";
  import { shownCalendarEvents } from "../../../frontend/Calendar/selected";
  import PreviousIcon from "lucide-svelte/icons/chevron-left";
  import NextIcon from "lucide-svelte/icons/chevron-right";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";

  export let range: CalendarRange;
  export let date: Date;
  export let showWeekNumbers = false;
  export let onSelectDay: (day: Date) => void;

  const now = CurrentTime.minute;

  let month = new DateNavigatorMonth(date);
  $: followDate(date);
  function followDate(date: Date) {
    if (!month.isInMonth(date)) {
      month = new DateNavigatorMonth(date);
    }
  }

  $: daysWithEvents = month.daysWithEvents($shownCalendarEvents.contents);

  function dayBefore(day: Date): Date {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1);
  }

  function dayAfter(day: Date): Date {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
  }
</script>

<style>
  .date-navigator {
    padding: 4px 8px 8px 8px;
    user-select: none;
  }
  .title-row {
    align-items: center;
    height: 32px;
  }
  .title {
    justify-content: center;
    font-weight: 600;
  }
  .arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-fg-secondary);
    cursor: pointer;
  }
  .arrow:hover {
    background-color: var(--lo-hover-bg);
    color: var(--lo-fg);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    row-gap: 2px;
  }
  .week-numbers .grid {
    grid-template-columns: auto repeat(7, 1fr);
  }
  .weekday {
    height: 24px;
    line-height: 24px;
    text-align: center;
    font-size: 11px;
    color: var(--lo-fg-secondary);
  }
  .week-number {
    min-width: 20px;
    padding-inline-end: 4px;
    font-size: 11px;
    line-height: 28px;
    text-align: center;
    color: var(--lo-fg-secondary);
    border-inline-end: 1px solid var(--lo-divider);
  }
  .day {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0;
    border: none;
    background: none;
    color: var(--lo-fg);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  .day.in-range {
    background-color: var(--lo-selected-bg);
  }
  .day.range-start {
    border-start-start-radius: var(--lo-radius-small);
    border-end-start-radius: var(--lo-radius-small);
  }
  .day.range-end {
    border-start-end-radius: var(--lo-radius-small);
    border-end-end-radius: var(--lo-radius-small);
  }
  .number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }
  .day:hover .number {
    background-color: var(--lo-hover-bg);
  }
  .day.in-range:hover .number {
    background-color: var(--lo-selected-hover-bg);
  }
  .day.other-month {
    color: var(--lo-fg-secondary);
  }
  .day.has-events {
    font-weight: 700;
  }
  .day.today .number,
  .day.today:hover .number {
    background-color: var(--lo-accent);
    color: var(--lo-accent-fg);
    font-weight: 700;
  }
</style>
