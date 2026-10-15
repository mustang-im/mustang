<hbox class="calendar-header">
  <button class="today-button" title={$t`Go to today`} on:click={onToday}>
    {$t`Today`}
  </button>
  <button class="arrow-button" title={previousLabel} aria-label={previousLabel} on:click={() => onStep(-1)}>
    <PreviousIcon size="16" />
  </button>
  <button class="arrow-button" title={nextLabel} aria-label={nextLabel} on:click={() => onStep(1)}>
    <NextIcon size="16" />
  </button>
  <h1 class="title">{range.title(getDateTimeLocale())}</h1>
  <hbox flex />
  <slot />
  <button class="view-button" bind:this={viewButtonEl} on:click={() => isViewMenuOpen = !isViewMenuOpen}
    aria-haspopup="menu" title={$t`Change the view`}>
    <svelte:component this={viewIcons[view]} size="16" />
    <span>{viewLabels[view]}</span>
    <ChevronIcon size="14" />
  </button>
  <Menu bind:isMenuOpen={isViewMenuOpen} anchor={viewButtonEl} placement="bottom-end">
    {#each viewTypes as viewType}
      <MenuItem label={viewLabels[viewType]} icon={viewIcons[viewType]} selected={viewType == view}
        onClick={() => onView(viewType)} />
    {/each}
  </Menu>
</hbox>

<script lang="ts">
  import type { CalendarViewType } from "../CalendarSettings";
  import type { CalendarRange } from "./CalendarRange";
  import Menu from "../../../frontend/Shared/Menu/Menu.svelte";
  import MenuItem from "../../../frontend/Shared/Menu/MenuItem.svelte";
  import PreviousIcon from "lucide-svelte/icons/chevron-left";
  import NextIcon from "lucide-svelte/icons/chevron-right";
  import ChevronIcon from "lucide-svelte/icons/chevron-down";
  import DayIcon from "lucide-svelte/icons/calendar-1";
  import WorkWeekIcon from "lucide-svelte/icons/columns-4";
  import WeekIcon from "lucide-svelte/icons/calendar-range";
  import MonthIcon from "lucide-svelte/icons/calendar-days";
  import { getDateTimeLocale, t } from "../../../l10n/l10n";

  export let range: CalendarRange;
  export let view: CalendarViewType;
  export let onToday: () => void;
  export let onStep: (direction: number) => void;
  export let onView: (view: CalendarViewType) => void;

  const viewTypes: CalendarViewType[] = ["day", "workweek", "week", "month"];
  const viewIcons = { day: DayIcon, workweek: WorkWeekIcon, week: WeekIcon, month: MonthIcon };

  let viewButtonEl: HTMLButtonElement;
  let isViewMenuOpen = false;

  $: viewLabels = { day: $t`Day`, workweek: $t`Work Week`, week: $t`Week`, month: $t`Month` };
  $: previousLabel = view == "month" ? $t`Previous month` : view == "day" && range.days.length == 1 ? $t`Previous day` : $t`Previous`;
  $: nextLabel = view == "month" ? $t`Next month` : view == "day" && range.days.length == 1 ? $t`Next day` : $t`Next`;
</script>

<style>
  .calendar-header {
    align-items: center;
    gap: 4px;
    min-height: 52px;
    padding: 0 12px 0 16px;
  }
  .today-button,
  .arrow-button,
  .view-button {
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
  .view-button {
    gap: 6px;
    padding: 0 8px 0 10px;
    border-color: transparent;
    background: none;
  }
  .today-button:hover,
  .arrow-button:hover,
  .view-button:hover {
    background-color: var(--lo-hover-bg);
  }
  .today-button:active,
  .arrow-button:active,
  .view-button:active {
    background-color: var(--lo-pressed-bg);
  }
  .view-button :global(svg:first-child) {
    color: var(--lo-accent-text);
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
