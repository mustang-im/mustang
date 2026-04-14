<select bind:value={duration}>
  <option value={onlyDays ? 3 * k1DayS : 1 * k1MinuteS}>Other</option>
  {#if !onlyDays}
    {#each kMinOptions as min}
      <option value={min * k1MinuteS}>{min} {$plural(min, { one: 'minute', other: 'minutes' })}</option>
    {/each}
    {#each kHourOptions as hour}
      <option value={hour * k1HourS}>{hour} {$plural(hour, { one: 'hour', other: 'hours' })}</option>
    {/each}
  {/if}
  {#each kDayOptions as day}
    <option value={day * k1DayS}>{day} {$plural(day, { one: 'day', other: 'days' })}</option>
  {/each}
</select>

<script lang="ts">
  import { plural } from "../../../l10n/l10n";

  export let duration: number;
  export let onlyDays = false;
</script>

<script lang="ts" context="module">
  import { k1DayS, k1HourS, k1MinuteS } from "../../Util/date";

  const kMinOptions = [10, 15, 20, 30, 45];
  const kHourOptions = [1, 1.5, 2, 4];
  const kDayOptions = [1, 2, 5];
  export const kOptionsInS = kMinOptions.map(min => min * k1MinuteS)
    .concat(kHourOptions.map(hour => hour * k1HourS))
    .concat(kDayOptions.map(day => day * k1DayS));
</script>
