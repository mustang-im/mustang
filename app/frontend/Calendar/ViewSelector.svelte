<NativeSelect
    data={dateIntervalOptions}
    bind:value={dateIntervalSelected}
/>

<script lang="ts">
  import type { DateInterval } from "./selected";
  import { NativeSelect } from '@svelteuidev/core';
  import { t } from "../../l10n/l10n";

  export let dateInterval: DateInterval = 7; /* in/out */

  function dateIntervalLabel(interval: DateInterval) {
    if (interval == 0) {
      return $t`List`;
    } else if (interval == 1) {
      return $t`Day`;
    } else if (interval == 7) {
      return $t`Week`;
    } else if (interval == 31) {
      return $t`Month`;
    } else if (interval == 28) {
      return $t`4 Weeks`;
    } else if (interval == 2) {
      return $t`Day/Month`;
    } else {
      return $t`${interval} days`;
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
