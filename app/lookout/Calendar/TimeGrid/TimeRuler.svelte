<div class="time-ruler">
  {#each hours as hour}
    <span class="hour-label" style="top: {hour * 60 * pxPerMinute}px">{hourLabel.label(hour)}</span>
  {/each}
</div>

<script lang="ts">
  import { HourLabel } from "./HourLabel";
  import { getDateTimeLocale } from "../../../l10n/l10n";

  export let pxPerMinute: number;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourLabel = new HourLabel(getDateTimeLocale());
</script>

<style>
  .time-ruler {
    grid-column: 1;
    grid-row: 1;
    position: relative;
  }
  .hour-label {
    position: absolute;
    inset-inline-end: 8px;
    margin-block-start: 3px;
    line-height: 1;
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
    white-space: nowrap;
  }
</style>
