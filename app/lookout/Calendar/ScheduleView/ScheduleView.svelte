<div class="schedule-view" bind:this={scrollEl} on:scroll={onScroll}
  style="--name-width: {kNameWidth}px; --px-per-hour: {pxPerHour}px; --slot-width: {pxPerHour * timeScale / 60}px; --track-width: {trackWidth}px">
  <div class="head">
    <div class="corner" />
    <div class="track">
      {#each range.days as day, d}
        <div class="date" class:today={CurrentTime.isToday(day, $now)} style="left: {d * dayWidth}px; width: {dayWidth}px">
          <span class="date-label">{dateFormat.format(day)}</span>
        </div>
        {#each hours as hour}
          <div class="hour" style="left: {d * dayWidth + hour * pxPerHour}px; width: {pxPerHour}px">
            {hourLabel.label(hour)}
          </div>
        {/each}
      {/each}
    </div>
  </div>
  {#each rows as row (row.calendar.id)}
    <ScheduleRow calendar={row.calendar} events={row.events} days={range.days} {pxPerHour} {timeScale}
      nowMinute={showsNow ? nowMinute : null}
      isSelected={$selectedCalendar == row.calendar} />
  {:else}
    <div class="empty">{$t`Select a calendar in the folder pane to show it here.`}</div>
  {/each}
</div>

<script lang="ts">
  import type { CalendarColumnGroup } from "../TimeGrid/TimeGrid.svelte";
  import type { CalendarRange } from "../View/CalendarRange";
  import { ScheduleLayout } from "./ScheduleLayout";
  import { HourLabel } from "../TimeGrid/HourLabel";
  import { CurrentTime } from "../View/CurrentTime";
  import { WorkingHours } from "../View/WorkingHours";
  import { eventPeek } from "../Selected";
  import { selectedCalendar } from "../../../frontend/Calendar/selected";
  import ScheduleRow from "./ScheduleRow.svelte";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";
  import { tick } from "svelte";

  export let range: CalendarRange;
  export let rows: CalendarColumnGroup[];
  export let timeScale: number;

  const kNameWidth = 160;
  const kSlotWidth = 56;
  const now = CurrentTime.minute;
  const hours = Array.from({ length: 24 }, (_, hour) => hour);
  const hourLabel = new HourLabel(getDateTimeLocale());
  const dateFormat = new Intl.DateTimeFormat(getDateTimeLocale(), { dateStyle: "full" });

  let scrollEl: HTMLDivElement;

  $: pxPerHour = kSlotWidth * 60 / timeScale;
  $: dayWidth = pxPerHour * 24;
  $: trackWidth = dayWidth * range.days.length;
  $: timeline = new ScheduleLayout([], range.days);
  $: nowMinute = timeline.minuteOf($now);
  $: showsNow = range.contains($now);

  function onScroll() {
    $eventPeek = null;
  }

  $: range.start.getTime(), pxPerHour, scrollToFocus();
  async function scrollToFocus() {
    await tick();
    if (!scrollEl) {
      return;
    }
    let focusHour = showsNow ? Math.max($now.getHours() - 1, 0) : WorkingHours.startHour;
    let dayIndex = showsNow ? Math.floor(nowMinute / ScheduleLayout.kMinutesPerDay) : 0;
    scrollEl.scrollLeft = dayIndex * dayWidth + focusHour * pxPerHour;
  }
</script>

<style>
  .schedule-view {
    position: relative;
    flex: 1 1 0;
    min-height: 0;
    overflow: auto;
  }
  .head {
    position: sticky;
    top: 0;
    z-index: 4;
    display: flex;
    width: calc(var(--name-width) + var(--track-width));
    height: 52px;
    background-color: var(--lo-pane-bg);
    border-block-end: 1px solid var(--lo-border);
  }
  .corner {
    position: sticky;
    left: 0;
    z-index: 1;
    flex: none;
    width: var(--name-width);
    background-color: var(--lo-pane-bg);
    border-inline-end: 1px solid var(--lo-border);
  }
  .track {
    position: relative;
    flex: none;
    width: var(--track-width);
  }
  .date {
    position: absolute;
    top: 0;
    height: 26px;
    box-sizing: border-box;
    border-inline-start: 1px solid var(--lo-border);
    border-block-end: 1px solid var(--lo-divider);
    font-weight: 600;
    line-height: 26px;
  }
  .date.today {
    color: var(--lo-accent-text);
  }
  .date-label {
    position: sticky;
    left: calc(var(--name-width) + 8px);
    padding-inline: 8px;
  }
  .hour {
    position: absolute;
    top: 26px;
    height: 26px;
    box-sizing: border-box;
    padding-inline-start: 6px;
    border-inline-start: 1px solid var(--lo-divider);
    color: var(--lo-fg-secondary);
    font-size: var(--lo-font-size-small);
    line-height: 26px;
    white-space: nowrap;
  }
  .empty {
    position: sticky;
    left: 0;
    width: max-content;
    padding: 32px 16px;
    color: var(--lo-fg-secondary);
  }
</style>
