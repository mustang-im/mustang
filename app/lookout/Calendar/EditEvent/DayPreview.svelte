<vbox class="day-preview">
  <hbox class="header">
    <span class="day">{dayLabel}</span>
    <hbox flex />
    {#if onShowInCalendar}
      <button class="open" on:click={onShowInCalendar} title={$t`Show this day in the calendar`}>
        <CalendarIcon size={14} />
        {$t`Calendar…`}
      </button>
    {/if}
  </hbox>
  {#if allDayItems.length}
    <vbox class="all-day">
      {#each allDayItems as item}
        <hbox class="lo-event status-{item.look.status}" class:current={item.isCurrent}
          style:--event-color={item.look.color ?? "var(--lo-accent)"} title={item.look.tooltip(locale)}>
          <hbox class="lo-event-bar" />
          <span class="title">{item.look.title}</span>
        </hbox>
      {/each}
    </vbox>
  {/if}
  {#if hours.length}
    <hbox class="grid" style:height="{hours.length * kHourHeight}px">
      <vbox class="hours">
        {#each hours as hour}
          <span class="hour" style:height="{kHourHeight}px">{hourLabel.label(hour)}</span>
        {/each}
      </vbox>
      <vbox flex class="column">
        {#each hours as hour}
          <hbox class="slot" style:height="{kHourHeight}px" />
        {/each}
        {#each timedItems as item}
          <hbox class="lo-event status-{item.look.status}" class:current={item.isCurrent}
            style:--event-color={item.look.color ?? "var(--lo-accent)"}
            style:top="{item.top}px" style:height="{Math.max(item.height - 1, 14)}px"
            style:left="calc({item.lane} * 100% / {item.lanes})" style:width="calc(100% / {item.lanes} - 2px)"
            title={item.look.tooltip(locale)}>
            <hbox class="lo-event-bar" />
            <span class="title"><b>{item.look.title}</b>{item.event.location ? "; " + item.event.location : ""}</span>
          </hbox>
        {/each}
      </vbox>
    </hbox>
  {/if}
</vbox>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { appGlobal } from "../../../logic/app";
  import { DayPreviewLayout } from "./DayPreviewLayout";
  import { HourLabel } from "../TimeGrid/HourLabel";
  import "../Event/EventLook.css";
  import CalendarIcon from "lucide-svelte/icons/calendar-days";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";

  export let event: Event;
  export let onShowInCalendar: () => void = null;

  const kHourHeight = 36;
  const locale = getDateTimeLocale();
  const hourLabel = new HourLabel(locale);
  const calendarEvents = appGlobal.calendarEvents;

  $: layout = new DayPreviewLayout($event, $calendarEvents, kHourHeight);
  $: dayLabel = layout.day.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  $: hours = layout.hours;
  $: timedItems = layout.timedItems;
  $: allDayItems = layout.allDayItems;
</script>

<style>
  .day-preview {
    flex-shrink: 0;
    border: 1px solid var(--lo-divider);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    font-size: var(--lo-font-size-small);
  }
  .header {
    align-items: center;
    min-height: 28px;
    padding: 0 4px 0 8px;
    border-block-end: 1px solid var(--lo-divider);
    background-color: var(--lo-pane-alt-bg);
  }
  .day {
    font-weight: 600;
  }
  .open {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    padding: 0 6px;
    border: none;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-accent-text);
    font: inherit;
    cursor: pointer;
  }
  .open:hover {
    background-color: var(--lo-hover-bg);
  }
  .all-day {
    gap: 2px;
    padding: 2px 4px 2px 56px;
    border-block-end: 1px solid var(--lo-divider);
  }
  .all-day .lo-event {
    height: 20px;
    align-items: center;
  }
  .grid {
    position: relative;
    overflow: hidden;
  }
  .hours {
    flex-shrink: 0;
    width: 52px;
    border-inline-end: 1px solid var(--lo-divider);
  }
  .hour {
    box-sizing: border-box;
    padding: 2px 6px 0 0;
    border-block-end: 1px solid var(--lo-divider);
    color: var(--lo-fg-secondary);
    text-align: end;
    white-space: nowrap;
  }
  .column {
    position: relative;
  }
  .slot {
    box-sizing: border-box;
    flex-shrink: 0;
    border-block-end: 1px solid var(--lo-divider);
  }
  .column .lo-event {
    position: absolute;
    margin-inline-start: 2px;
  }
  .lo-event.current {
    outline: 2px solid var(--lo-fg);
    outline-offset: -1px;
    z-index: 1;
  }
  .title {
    min-width: 0;
    padding: 1px 6px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
