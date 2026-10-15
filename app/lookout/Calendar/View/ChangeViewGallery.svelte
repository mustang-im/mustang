<div class="gallery" role="listbox" aria-label={$t`Change View`}>
  {#each views as view (view.id)}
    <button class="tile" class:selected={view.id == currentView}
      role="option" aria-selected={view.id == currentView}
      title={view.tooltip}
      on:click={() => choose(view.id)}>
      <svelte:component this={view.icon} size="28" strokeWidth={1.5} />
      <span class="label">{view.label}</span>
    </button>
  {/each}
</div>

<script lang="ts">
  import { CalendarCurrentView } from "../CalendarSettings";
  import CalendarIcon from "lucide-svelte/icons/calendar-days";
  import PreviewIcon from "lucide-svelte/icons/scan-text";
  import ListIcon from "lucide-svelte/icons/list";
  import ActiveIcon from "lucide-svelte/icons/list-todo";
  import { getContext } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let currentView: CalendarCurrentView;
  export let onChange: (view: CalendarCurrentView) => void;

  const closeMenu = getContext<() => void>("onMenuClose");

  $: views = [
    { id: CalendarCurrentView.Calendar, label: $t`Calendar`, icon: CalendarIcon, tooltip: $t`Day, week and month calendar` },
    { id: CalendarCurrentView.Preview, label: $t`Preview`, icon: PreviewIcon, tooltip: $t`Calendar with location and notes in the appointments` },
    { id: CalendarCurrentView.List, label: $t`List`, icon: ListIcon, tooltip: $t`All appointments and meetings in a table` },
    { id: CalendarCurrentView.Active, label: $t`Active`, icon: ActiveIcon, tooltip: $t`Appointments and meetings that are still to come` },
  ];

  function choose(view: CalendarCurrentView) {
    closeMenu?.();
    onChange(view);
  }
</script>

<style>
  .gallery {
    display: grid;
    grid-template-columns: repeat(4, 80px);
    gap: 4px;
    padding: 4px 8px;
  }
  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 72px;
    padding: 4px;
    border: 1px solid transparent;
    border-radius: var(--lo-radius-small);
    background: none;
    color: var(--lo-accent-text);
    font: inherit;
    cursor: pointer;
  }
  .tile:hover {
    background-color: var(--lo-hover-bg);
  }
  .tile.selected {
    border-color: var(--lo-accent);
    background-color: var(--lo-selected-bg);
  }
  .label {
    color: var(--lo-fg);
    font-size: var(--lo-font-size-small);
  }
</style>
