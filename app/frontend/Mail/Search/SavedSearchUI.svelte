<vbox class="saved-search">
  {#if search && folder}
    <input type="text" bind:value={folder.name} placeholder="Name of the folder" />
  {/if}
  <hbox class="buttons">
    <Button
      icon={SaveIcon}
      label="Save as folder"
      onClick={onSave}
    />
  </hbox>
</vbox>

<script lang="ts">
  import { onMount } from "svelte";
  import type { SearchEMail } from "../../../logic/Mail/SQL/SearchEMail";
  import { SavedSearchFolder } from "../../../logic/Mail/Virtual/SavedSearchFolder";
  import Button from "../../Shared/Button.svelte";
  import SaveIcon from "lucide-svelte/icons/save";

  /** in */
  export let search: SearchEMail;

  $: folder = new SavedSearchFolder(search);

  async function onSave() {
    await folder.save();
  }
</script>

<style>
  input {
    margin: 12px;
    padding: 2px 4px;
    font-size: 16px;
  }
  .buttons {
    margin: 12px;
    justify-content: end;
  }
</style>
