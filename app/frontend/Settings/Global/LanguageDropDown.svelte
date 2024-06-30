<select bind:value={language} on:change>
  {#each Object.keys(localeNames) as langCode }
    <option value={langCode}>
      {localeNames[langCode]}
    </option>
  {/each}
</select>

<script lang="ts">
  import { localeNames } from "../../../l10n/list";

  /** 2-letter ISO language code. in/out */
  export let language: string;
</script>

<style>
</style>
