<NativeSelect
    data={dateIntervalOptions}
    bind:value={dateIntervalSelected}
/>

<script lang="ts">
  import type { DateInterval } from "./selected";
  import { NativeSelect } from '@svelteuidev/core';

  export let dateInterval: DateInterval = 7; /* in/out */

  function dateIntervalLabel(interval: DateInterval) {
    // TODO l10n
    if (interval == 0) {
      return "List";
    } else if (interval == 1) {
      return "Day";
    } else if (interval == 7) {
      return "Week";
    } else if (interval == 31) {
      return "Month";
    } else if (interval == 28) {
      return "4 Weeks";
    } else if (interval == 2) {
      return "Day/Month";
    } else {
      return interval + " days";
    }
  }

  let dateIntervalSelected = dateInterval.toString();
  $: dateInterval = parseInt(dateIntervalSelected) as DateInterval;
  const dateIntervalOptions = [
    { value: "1", label: dateIntervalLabel(1) },
    { value: "7", label: dateIntervalLabel(7) },
    { value: "2", label: dateIntervalLabel(2) },
    { value: "28", label: dateIntervalLabel(28) },
    { value: "31", label: dateIntervalLabel(31) },
    { value: "0", label: dateIntervalLabel(0) },
  ];
</script>

<style>
</style>
