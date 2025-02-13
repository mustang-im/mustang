<select id="duration-unit" bind:value={unitStr} {disabled}>
  <option value="60">{$t`Minutes`}</option>
  <option value="3600">{$t`Hours`}</option>
  <option value="86400">{$t`Days`}</option>
</select>

<script lang="ts">
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ change: number }>();

  export let durationInSeconds: number; /* in/out */
  export let durationInUnit: number; /* in/out */
  export let disabled = false;

  let unitStr: string;
  $: unitInSeconds = parseInt(unitStr);

  $: durationInUnit = durationInSeconds / unitInSeconds;

  export function onChange() {
    durationInSeconds = durationInUnit * unitInSeconds;
    dispatch("change", durationInSeconds);
  }
</script>

<style>
</style>
