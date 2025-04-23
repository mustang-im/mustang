<select id="duration-unit" bind:value={unitInSeconds} {disabled}>
  {#if !onlyDays}
    <option value={k1MinuteS}>{$t`Minutes`}</option>
    <option value={k1HourS}>{$t`Hours`}</option>
  {/if}
  <option value={k1DayS}>{$t`Days`}</option>
</select>

<script lang="ts">
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  import { k1DayS, k1HourS, k1MinuteS } from "../../Util/date";
  const dispatch = createEventDispatcher<{ change: number }>();

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

  $: unitInSeconds, onUnitChanged()
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
  export function onDurationChanged() {
    if (durationInSeconds <= 0) {
      durationInSeconds = 60;
    }

    // Adapt unit
    if (durationInSeconds % k1DayS == 0) {
      newUnit(k1DayS);
    } else if (durationInSeconds % k1HourS == 0) {
      newUnit(k1HourS);
    } else if (unitInSeconds != k1MinuteS) {
      newUnit(k1MinuteS);
    }
    dispatch("change", durationInSeconds);
  }

  function newUnit(aUnitInSeconds: number) {
    unitInSeconds = aUnitInSeconds;
    durationInUnit = durationInSeconds / aUnitInSeconds;
  }
</script>

<style>
</style>
