<select id="duration-unit" bind:value={unitInSeconds} {disabled}>
  {#if !onlyDays}
    <option value={k1MinuteS}>{$plural(durationInUnit, { one: 'minute', other: 'minutes' })}</option>
    <option value={k1HourS}>{$plural(durationInUnit, { one: 'hour', other: 'hours' })}</option>
  {/if}
  <option value={k1DayS}>{$plural(durationInUnit, { one: 'day', other: 'days' })}</option>
</select>

<script lang="ts">
  import { k1DayS, k1HourS, k1MinuteS } from "../../Util/date";
  import { plural, t } from "../../../l10n/l10n";

  export let durationInSeconds: number; /* in/out */
  export let durationInUnit: number; /* in/out */
  export let onlyDays = false;
  export let disabled = false;

  let unitInSeconds: number;

  /** You must call this on:input when the user changed the input field of `durationInUnit` */
  export function onDurationInUnitChanged() {
    durationInSeconds = durationInUnit * unitInSeconds;
  }

  $: durationInUnit = durationInSeconds / unitInSeconds;

  const onlyRoundNumbers = false;
  $: unitInSeconds, onlyRoundNumbers && onUnitChanged()
  function onUnitChanged() {
    if (!durationInUnit) { // startup
      return;
    }
    // After changing unit, and after re-calculating `durationInUnit`,
    // ensure round numbers
    if (durationInUnit % 1 != 0) {
      durationInUnit = Math.ceil(durationInUnit);
      durationInSeconds = durationInUnit * unitInSeconds;
    }
  }

  $: onlyDays && onDaysOnly()
  function onDaysOnly() {
    durationInSeconds = Math.round(Math.ceil(Math.max(durationInSeconds, 1) / k1DayS) * k1DayS);
    newUnit(k1DayS);
  }

  $: durationInSeconds, onDurationChanged()
  function onDurationChanged() {
    // Adapt unit
    if (durationInSeconds % k1DayS == 0) {
      newUnit(k1DayS);
    } else if (durationInSeconds % k1HourS == 0) {
      newUnit(k1HourS);
    } else if (unitInSeconds != k1MinuteS) {
      newUnit(k1MinuteS);
    }
  }

  function newUnit(aUnitInSeconds: number) {
    unitInSeconds = aUnitInSeconds;
    durationInUnit = durationInSeconds / aUnitInSeconds;
  }
</script>

<style>
</style>
