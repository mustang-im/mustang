<CheckBox label={name} checked={$day.isWorkDay} {disabled}
  onChange={checked => { day.isWorkDay = checked; }} />
<TimeCombo time={times.timeOf($day.startMinutes)} options={times.startTimes}
  label={$t`Start time on ${name}`} disabled={!!disabled || !$day.isWorkDay}
  onChange={time => { day.startMinutes = times.minutesOf(time); }} />
<span class="until" class:disabled={!!disabled || !$day.isWorkDay}>{$t`to`}</span>
<TimeCombo time={times.timeOf($day.endMinutes)} options={times.endTimes}
  label={$t`End time on ${name}`} disabled={!!disabled || !$day.isWorkDay}
  onChange={time => { day.endMinutes = times.minutesOf(time, true); }} />

<script lang="ts">
  import type { WorkDay } from "../../../logic/Calendar/WorkHours";
  import type { WorkTimeOptions } from "./WorkTimeOptions";
  import CheckBox from "../../Shared/Form/CheckBox.svelte";
  import TimeCombo from "../../Calendar/EditEvent/TimeCombo.svelte";
  import { t } from "../../../l10n/l10n";

  export let day: WorkDay;
  export let name: string;
  export let times: WorkTimeOptions;
  export let disabled: boolean | string = false;
</script>

<style>
  .until {
    color: var(--lo-fg-secondary);
  }
  .until.disabled {
    color: var(--lo-fg-disabled);
  }
</style>
