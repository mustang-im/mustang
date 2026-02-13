<select bind:value={duration}>
  {#each [10, 15, 20, 30, 45] as min}
    <option value={min}>{min} {$plural(min, { one: 'minute', other: 'minutes' })}</option>
  {/each}
  {#each [1, 1.5, 2, 4, 8] as hour}
    <option value={hour * 60}>{hour} {$plural(1, { one: 'hour', other: 'hours' })}</option>
  {/each}
</select>

<script lang="ts">
  import { plural } from "../../../l10n/l10n";

  export let duration: number;
</script>

<style>
</style>
