<select bind:value={specialFolderType}>
  {#each specialFolderOrder as type }
    <option value={type}>
      {type}
    </option>
  {/each}
</select>

<script lang="ts">
  import { SpecialFolder, specialFolderOrder } from "../../../../logic/Mail/Folder";

  export let specialFolderType: SpecialFolder;
</script>

<style>
  option, select {
    text-transform: capitalize;
  }
</style>
