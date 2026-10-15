<button class="day-header" class:today={isToday}
  style="grid-column: {column}"
  title={day.toLocaleDateString(getDateTimeLocale(), { dateStyle: "full" })}
  on:click={() => onOpenDay(day)}
  bind:clientWidth={width}>
  <span class="number">{day.toLocaleDateString(getDateTimeLocale(), { day: "numeric" })}</span>
  <span class="weekday">{day.toLocaleDateString(getDateTimeLocale(), { weekday: width >= 90 ? "long" : "short" })}</span>
</button>

<script lang="ts">
  import { getDateTimeLocale } from "../../../l10n/l10n";

  export let day: Date;
  export let column: number;
  export let isToday = false;
  export let onOpenDay: (day: Date) => void;

  let width = 100;
</script>

<style>
  .day-header {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    padding: 6px 8px 4px 8px;
    border: none;
    border-inline-start: 1px solid var(--lo-divider);
    background: none;
    color: var(--lo-fg);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  .day-header:hover {
    background-color: var(--lo-hover-bg);
  }
  .number {
    font-size: 22px;
    font-weight: 300;
    line-height: 28px;
  }
  .weekday {
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
  }
  .today .number {
    font-weight: 600;
  }
  .today .number,
  .today .weekday {
    color: var(--lo-accent-text);
  }
  .today::before {
    content: "";
    position: absolute;
    top: 0;
    inset-inline: 0;
    height: 3px;
    background-color: var(--lo-accent);
  }
</style>
