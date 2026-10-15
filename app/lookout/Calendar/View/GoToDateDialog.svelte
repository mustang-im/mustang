<Dialog title={$t`Go To Date`}
  okLabel={$t`OK`}
  okDisabled={!selectedDate && $t`Enter a date`}
  onOK={onOK}
  width="320px"
  on:close>
  <vbox class="fields">
    <label class="field">
      <span class="label">{$t`Date`}</span>
      <input type="date" class="lo-text-field" required bind:value={dateValue} />
    </label>
    <label class="field">
      <span class="label">{$t`Show in`}</span>
      <select class="lo-text-field" bind:value={view}>
        <option value="day">{$t`Day Calendar`}</option>
        <option value="workweek">{$t`Work Week Calendar`}</option>
        <option value="week">{$t`Week Calendar`}</option>
        <option value="month">{$t`Month Calendar`}</option>
      </select>
    </label>
  </vbox>
</Dialog>

<script lang="ts">
  import type { CalendarViewType } from "../CalendarSettings";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let date: Date;
  export let view: CalendarViewType;
  export let onGoTo: (date: Date, view: CalendarViewType) => void;

  let dateValue = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  $: selectedDate = parseDate(dateValue);
  function parseDate(value: string): Date | null {
    let [ year, month, day ] = value.split("-").map(part => parseInt(part));
    return year && month && day ? new Date(year, month - 1, day) : null;
  }

  function onOK() {
    onGoTo(selectedDate, view);
  }
</script>

<style>
  .fields {
    gap: 12px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .label {
    font-size: var(--lo-font-size-small);
    color: var(--lo-fg-secondary);
  }
</style>
