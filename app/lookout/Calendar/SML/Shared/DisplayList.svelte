<vbox class="times" role="list">
  {#each days as day (day.day.getTime())}
    <span class="day-header">{SMLTimeOptions.dayLabel(day.day)}</span>
    {#each day.times as time (time.getTime())}
      {@const conflicts = SMLTimeOptions.conflicts(time, duration, $events)}
      <hbox class="time-row" role="listitem">
        <vbox flex class="time-text">
          <span class="time">{TimeOptions.timeLabel(time)} – {TimeOptions.timeLabel(SMLTimeOptions.end(time, duration))}</span>
          {#if conflicts.length}
            <span class="conflict">
              <ConflictIcon size={12} />
              {$t`Conflicts with ${conflicts.map(event => event.title || gt`(no title)`).join(", ")}`}
            </span>
          {/if}
        </vbox>
        <slot {time} />
      </hbox>
    {/each}
  {:else}
    <span class="empty">{emptyText ?? $t`No times were proposed.`}</span>
  {/each}
</vbox>

<script lang="ts">
  import { SMLTimeOptions } from "./SMLTimeOptions";
  import { TimeOptions } from "../../EditEvent/TimeOptions";
  import { appGlobal } from "../../../../logic/app";
  import type { Collection } from "svelte-collections";
  import ConflictIcon from "lucide-svelte/icons/triangle-alert";
  import { gt, t } from "../../../../l10n/l10n";

  export let options: Collection<Date>;
  export let duration: number;
  export let emptyText: string = null;

  let events = appGlobal.calendarEvents;
  $: days = SMLTimeOptions.byDay($options.contents);
</script>

<style>
  .times {
    max-height: 320px;
    overflow-y: auto;
  }
  .day-header {
    padding: 8px 0 2px 0;
    font-size: var(--lo-font-size-small);
    font-weight: 600;
  }
  .time-row {
    align-items: center;
    gap: 12px;
    min-height: 32px;
    padding: 4px 0;
    border-bottom: 1px solid var(--lo-divider);
  }
  .time {
    font-variant-numeric: tabular-nums;
  }
  .conflict {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--lo-warning);
    font-size: var(--lo-font-size-small);
  }
  .empty {
    color: var(--lo-fg-secondary);
  }
</style>
