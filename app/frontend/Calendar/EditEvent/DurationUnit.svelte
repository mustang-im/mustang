<select id="duration-unit" bind:value={unitInSeconds} {disabled}>
  {#if !onlyDays}
    <option value={k1Minute}>{$t`Minutes`}</option>
    <option value={k1Hour}>{$t`Hours`}</option>
  {/if}
  <option value={k1Day}>{$t`Days`}</option>
</select>

<script lang="ts">
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
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
    durationInSeconds = Math.round(Math.ceil(Math.max(durationInSeconds, 1) / k1Day) * k1Day);
    newUnit(k1Day);
  }

  $: durationInSeconds, onDurationChanged()
  export function onDurationChanged() {
    if (durationInSeconds <= 0) {
      durationInSeconds = 60;
    }

    // Adapt unit
    if (durationInSeconds % k1Day == 0) {
      newUnit(k1Day);
    } else if (durationInSeconds % k1Hour == 0) {
      newUnit(k1Hour);
    } else if (unitInSeconds != k1Minute) {
      newUnit(k1Minute);
    }
    dispatch("change", durationInSeconds);
  }

  function newUnit(aUnitInSeconds: number) {
    unitInSeconds = aUnitInSeconds;
    durationInUnit = durationInSeconds / aUnitInSeconds;
  }

  const k1Day = 86400;
  const k1Hour = 3600;
  const k1Minute = 60;
</script>

<style>
</style>
