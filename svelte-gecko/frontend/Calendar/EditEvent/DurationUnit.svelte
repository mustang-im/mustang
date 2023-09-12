<select id="duration-unit" bind:value={unitStr}>
  <option value="60">Minutes</option>
  <option value="3600">Hours</option>
  <option value="86400">Days</option>
</select>

<script lang="ts">
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
