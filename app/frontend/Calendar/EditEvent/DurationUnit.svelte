<select id="duration-unit" bind:value={unitStr}>
  <option value="60">{$t`Minutes`}</option>
  <option value="3600">{$t`Hours`}</option>
  <option value="86400">{$t`Days`}</option>
</select>

<script lang="ts">
  import { t } from "../../../l10n/l10n";

  export let durationInSeconds: number; /* in/out */
  export let durationInUnit: number; /* in/out */

  let unitStr: string;
  $: unitInSeconds = parseInt(unitStr);

  $: durationInUnit = durationInSeconds / unitInSeconds;

  export function onChange() {
    durationInSeconds = durationInUnit * unitInSeconds;
  }
</script>

<style>
  input {
    border-top: none;
    border-left: none;
    border-right: none;
    width: 100%;
  }
</style>
