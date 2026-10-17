<hbox class="calendar-header">
  {#if onToday}
    <button class="today-button" title={$t`Go to today`} on:click={onToday}>
      {$t`Today`}
    </button>
  {/if}
  <button class="arrow-button" title={previousLabel} aria-label={previousLabel} on:click={() => onStep(-1)}>
    <PreviousIcon size="16" />
  </button>
  <button class="arrow-button" title={nextLabel} aria-label={nextLabel} on:click={() => onStep(1)}>
    <NextIcon size="16" />
  </button>
  <h1 class="title">{range.title(getDateTimeLocale())}</h1>
  <hbox flex />
  <slot />
</hbox>

<script lang="ts">
  import type { CalendarRange } from "./View/CalendarRange";
  import PreviousIcon from "lucide-svelte/icons/chevron-left";
  import NextIcon from "lucide-svelte/icons/chevron-right";
  import { getDateTimeLocale, t } from "../../l10n/l10n";

  export let range: CalendarRange;
  export let onToday: (() => void) | null = null;
  export let onStep: (direction: number) => void;

  $: isMonth = range.view == "month";
  $: stepsByDay = (range.view == "day" || range.view == "schedule") && range.days.length == 1 || range.view == "dual";
  $: previousLabel = isMonth ? $t`Previous month` : stepsByDay ? $t`Previous day` : $t`Previous`;
  $: nextLabel = isMonth ? $t`Next month` : stepsByDay ? $t`Next day` : $t`Next`;
</script>

<style>
  .calendar-header {
    align-items: center;
    gap: 4px;
    min-height: 52px;
    padding: 0 12px 0 16px;
  }
  .today-button,
  .arrow-button {
    display: flex;
    align-items: center;
    height: 32px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    font: inherit;
    cursor: pointer;
  }
  .today-button {
    padding: 0 12px;
    margin-inline-end: 4px;
  }
  .arrow-button {
    justify-content: center;
    width: 32px;
    padding: 0;
  }
  .today-button:hover,
  .arrow-button:hover {
    background-color: var(--lo-hover-bg);
  }
  .today-button:active,
  .arrow-button:active {
    background-color: var(--lo-pressed-bg);
  }
  .title {
    margin: 0 0 0 12px;
    font-size: var(--lo-font-size-large);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
