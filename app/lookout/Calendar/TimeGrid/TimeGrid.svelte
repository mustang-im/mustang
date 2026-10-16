<div class="time-grid" bind:this={scrollEl} on:scroll={onScroll} bind:clientHeight={viewHeight}
  style="--head-height: {headHeight}px">
  <div class="head" bind:offsetHeight={headHeight}>
    {#if isSplit}
      <div class="row" style="grid-template-columns: {columns}">
        {#each groups as group, g}
          <CalendarTab calendar={group.calendar} firstColumn={firstColumnOf(g)} span={range.days.length}
            isFirst={g == 0} {onOverlay} />
        {/each}
      </div>
    {/if}
    <div class="row" style="grid-template-columns: {columns}">
      {#each groups as group, g}
        {#each range.days as day, d}
          <DayHeader {day} column={firstColumnOf(g) + d} calendar={group.calendar} isToday={CurrentTime.isToday(day, $now)} {onOpenDay} />
        {/each}
      {/each}
    </div>
    <div class="row all-day-row" style="grid-template-columns: {columns}">
      {#if showsZoneLabels}
        <hbox class="zone-labels">
          {#each rulers as ruler, r}
            <span class="zone-label" class:primary={ruler.isPrimary} style="width: {rulerWidths[r]}px"
              title={ruler.shownLabel(range.days[0])}>{ruler.shownLabel(range.days[0])}</span>
          {/each}
        </hbox>
      {/if}
      {#each groupEvents as group, g}
        <AllDayStrip days={range.days} firstColumn={firstColumnOf(g)} events={group.allDay} calendar={group.calendar} group={g} />
      {/each}
    </div>
  </div>
  <div class="body" style="grid-template-columns: {columns}; height: {TimeColumnLayout.kMinutesPerDay * pxPerMinute}px; --slot-height: {kSlotHeight}px">
    <hbox class="rulers">
      {#each rulers as ruler, r}
        <TimeRuler {pxPerMinute} labels={rulerLabels[r]} isPrimary={ruler.isPrimary} width={rulerWidths[r]} />
      {/each}
    </hbox>
    {#each groupEvents as group, g}
      <div class="lines" style="grid-column: {firstColumnOf(g)} / span {range.days.length}">
        {#each slotStarts as minute}
          <div class="slot" class:hour={minute % 60 == 0} />
        {/each}
      </div>
      {#each range.days as day, d}
        <DayColumn {day} column={firstColumnOf(g) + d} dayIndex={d} group={g} events={group.timed} calendar={group.calendar}
          {pxPerMinute} {timeScale}
          isToday={CurrentTime.isToday(day, $now)}
          showsPastTimeLine={showsToday && CurrentTime.isBeforeToday(day, $now)}
          visibleFromMinute={visibleFromMinute} visibleToMinute={visibleToMinute} onScrollToMinute={scrollToMinute} />
      {/each}
    {/each}
  </div>
</div>

<script lang="ts" context="module">
  import type { Event } from "../../../logic/Calendar/Event";
  import type { Calendar } from "../../../logic/Calendar/Calendar";
  import type { Collection } from "svelte-collections";

  export interface CalendarColumnGroup {
    calendar: Calendar | null;
    events: Collection<Event>;
  }
</script>

<script lang="ts">
  import type { CalendarRange } from "../View/CalendarRange";
  import { TimeColumnLayout } from "./TimeColumnLayout";
  import { EventLook } from "../Event/EventLook";
  import { CurrentTime } from "../View/CurrentTime";
  import { WorkingHours } from "../View/WorkingHours";
  import { TimeZoneRuler } from "../View/TimeZones";
  import { eventPeek } from "../Selected";
  import DayHeader from "./DayHeader.svelte";
  import AllDayStrip from "./AllDayStrip.svelte";
  import DayColumn from "./DayColumn.svelte";
  import TimeRuler from "./TimeRuler.svelte";
  import CalendarTab from "./CalendarTab.svelte";
  import { onMount, tick } from "svelte";

  export let range: CalendarRange;
  export let groups: CalendarColumnGroup[];
  export let timeScale: number;
  export let onOpenDay: (day: Date) => void;
  export let onOverlay: () => void;

  const kSlotHeight = 24;
  const kRulerWidth = 56;
  const kWideRulerWidth = 76;
  const now = CurrentTime.minute;
  const rulerSettings = TimeZoneRuler.rulers;

  let scrollEl: HTMLDivElement;
  let viewHeight = 0;
  let headHeight = 0;

  $: isSplit = groups.length > 1;
  $: pxPerMinute = kSlotHeight / timeScale;
  $: showsToday = range.contains($now);
  $: rulers = $rulerSettings;
  $: showsZoneLabels = rulers.length > 1 || !!rulers[0]?.label;
  $: rulerLabels = rulers.map(ruler => ruler.hourLabels(range.days[0]));
  $: rulerWidths = rulerLabels.map(labels => labels.some(label => label.length > 5) ? kWideRulerWidth : kRulerWidth);
  $: columns = `${rulerWidths.reduce((sum, width) => sum + width, 0)}px ` +
    groups.map(() => `repeat(${range.days.length}, minmax(0, 1fr))`).join(" 8px ");
  $: slotStarts = Array.from({ length: TimeColumnLayout.kMinutesPerDay / timeScale }, (_, i) => i * timeScale);

  $: groupEvents = groups.map(group => {
    let inRange = group.events.filterObservable(event =>
      event.startTime < range.end && event.endTime > range.start);
    return {
      calendar: group.calendar,
      allDay: inRange.filterObservable(event => new EventLook(event).isInAllDayArea),
      timed: inRange.filterObservable(event => !new EventLook(event).isInAllDayArea),
    };
  });

  function firstColumnOf(group: number): number {
    return 2 + group * (range.days.length + 1);
  }

  let topMinute: number | null = null;
  function onScroll() {
    topMinute = scrollEl.scrollTop / pxPerMinute;
    $eventPeek = null;
  }

  $: visibleFromMinute = (topMinute ?? 0) + 1;
  $: visibleToMinute = (topMinute ?? 0) + Math.max(viewHeight - headHeight, 0) / pxPerMinute - 1;

  function scrollToMinute(minute: number) {
    scrollEl.scrollTo({ top: Math.max(minute - timeScale, 0) * pxPerMinute, behavior: "smooth" });
  }

  $: pxPerMinute, restoreScroll();
  async function restoreScroll() {
    await tick();
    if (scrollEl && topMinute != null) {
      scrollEl.scrollTop = topMinute * pxPerMinute;
    }
  }

  onMount(() => {
    let focusMinute = showsToday
      ? Math.max($now.getHours() - 1, 0) * 60
      : WorkingHours.startHour * 60;
    scrollEl.scrollTop = focusMinute * pxPerMinute;
    topMinute = focusMinute;
  });
</script>

<style>
  .time-grid {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
  }
  .head {
    position: sticky;
    top: 0;
    z-index: 6;
    background-color: var(--lo-pane-bg);
  }
  .row {
    display: grid;
  }
  .all-day-row {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }
  .zone-labels {
    grid-column: 1;
    grid-row: 1;
    align-self: end;
    min-width: 0;
  }
  .zone-label {
    flex: none;
    box-sizing: border-box;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    padding-inline: 2px 8px;
    padding-block-end: 2px;
    overflow: hidden;
    text-align: end;
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
  }
  .zone-label.primary {
    color: var(--lo-fg);
  }
  .rulers {
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
  }
  .body {
    display: grid;
    grid-template-rows: 100%;
    position: relative;
  }
  .lines {
    grid-row: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
    pointer-events: none;
  }
  .slot {
    flex: none;
    box-sizing: border-box;
    height: var(--slot-height);
    border-top: 1px dotted var(--lo-divider);
  }
  .slot.hour {
    border-top: 1px solid var(--lo-divider);
  }
  .slot:first-child {
    border-top-color: transparent;
  }
</style>
