<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="event-row" class:selected={isSelected} class:muted={look.status == "declined" || look.status == "cancelled"}
  role="row" aria-selected={isSelected}
  style="--event-color: {look.color ?? "var(--lo-accent)"}"
  on:click={onSelect}
  on:dblclick={onOpen}
  on:contextmenu={onContextMenu}>
  <span class="cell icon-cell" role="gridcell">
    <svelte:component this={icon} size="14" />
  </span>
  {#each columns as column (column)}
    <span class="cell" class:subject={column == EventTableColumn.Subject} role="gridcell">
      {#if column == EventTableColumn.Subject}
        {look.title}
      {:else if column == EventTableColumn.Location}
        {$event.location ?? ""}
      {:else if column == EventTableColumn.Start}
        {EventTable.timeLabel($event, false, getDateTimeLocale())}
      {:else if column == EventTableColumn.End}
        {EventTable.timeLabel($event, true, getDateTimeLocale())}
      {:else if column == EventTableColumn.Recurrence}
        {EventTable.recurrenceLabel($event)}
      {:else if column == EventTableColumn.Calendar}
        <span class="calendar-dot" />{$event.calendar?.name ?? ""}
      {/if}
    </span>
  {/each}
</div>

<script lang="ts">
  import type { Event } from "../../../logic/Calendar/Event";
  import { EventTable } from "./EventTable";
  import { EventTableColumn } from "../CalendarSettings";
  import { EventLook } from "../Event/EventLook";
  import AppointmentIcon from "lucide-svelte/icons/calendar";
  import RecurringIcon from "lucide-svelte/icons/repeat";
  import MeetingIcon from "lucide-svelte/icons/users-round";
  import { getDateTimeLocale } from "../../../l10n/l10n";

  export let event: Event;
  export let columns: EventTableColumn[];
  export let isSelected: boolean;
  export let onSelect: () => void;
  export let onOpen: () => void;
  export let onContextMenu: (mouseEvent: MouseEvent) => void;

  $: look = new EventLook($event);
  $: icon = $event.recurrenceRule ? RecurringIcon : look.isMeeting ? MeetingIcon : AppointmentIcon;
</script>

<style>
  .event-row {
    display: grid;
    grid-template-columns: var(--columns);
    flex-shrink: 0;
    position: relative;
    height: 28px;
    border-block-end: 1px solid var(--lo-divider);
    cursor: default;
  }
  .event-row:hover {
    background-color: var(--lo-hover-bg);
  }
  .event-row.selected {
    background-color: var(--lo-selected-bg);
  }
  .event-row.selected:hover {
    background-color: var(--lo-selected-hover-bg);
  }
  .event-row.selected::before {
    content: "";
    position: absolute;
    left: 0;
    top: 4px;
    bottom: 4px;
    width: 3px;
    border-radius: 2px;
    background-color: var(--lo-accent);
  }
  .event-row.muted {
    color: var(--lo-fg-secondary);
  }
  .cell {
    min-width: 0;
    line-height: 28px;
    padding: 0 8px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .muted .cell.subject {
    text-decoration: line-through;
  }
  .icon-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: var(--event-color);
  }
  .calendar-dot {
    display: inline-block;
    vertical-align: middle;
    width: 8px;
    height: 8px;
    margin-inline-end: 6px;
    border-radius: 50%;
    background-color: var(--event-color);
  }
</style>
