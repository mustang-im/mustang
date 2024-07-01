<select bind:value={specialFolderType}
  disabled={!!disabled} title={typeof(disabled) == "string" ? disabled : undefined}
  >
  {#each specialFolderOrder as type }
    <option value={type}>
      {specialFolderNames[type]}
    </option>
  {/each}
</select>

<script lang="ts">
  import { SpecialFolder, specialFolderNames, specialFolderOrder } from "../../../../logic/Mail/Folder";

  export let specialFolderType: SpecialFolder;
  export let disabled: boolean | string = false;
</script>

<style>
  option, select {
    text-transform: capitalize;
  }
</style>
