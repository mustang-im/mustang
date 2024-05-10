{#if needNewFolderName}
  <grid class="create-folder">
    <label for="new-name">New folder name</label>
    <input type="text" bind:value={newFolderName} name="new-name" />
    <Button label="Create sub-folder"
      classes="create"
      onClick={onCreateSubFolder}
      />
  </grid>
{:else}
  <hbox class="buttons">
    <Button label="Delete folder"
      classes="delete"
      icon={DeleteIcon}
      onClick={onDelete}
      />
    <Button label="Create sub-folder"
      classes="create"
      icon={CreateFolderIcon}
      onClick={onOpenCreateSubFolder}
      />
    <slot name="buttons-bottom-right" />
  </hbox>
{/if}

<script lang="ts">
  import type { Folder } from "../../../../logic/Mail/Folder";
  import Button from "../../../Shared/Button.svelte";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import CreateFolderIcon from "lucide-svelte/icons/folder-plus";
  import CloseIcon from "lucide-svelte/icons/x";
  import { assert } from "../../../../logic/util/util";

  export let folder: Folder;

  async function onDelete() {
    let confirmed = confirm(`Are you sure that you want to the delete folder ${folder.name} and all messages in it? This will also delete it on the server.`);
    if (!confirmed) {
      return;
    }
    await folder.deleteIt();
  }

  let newFolderName: string | undefined;
  let needNewFolderName = false;
  function onOpenCreateSubFolder() {
    needNewFolderName = true;
  }

  async function onCreateSubFolder() {
    assert(needNewFolderName, "Need folder name");
    assert(newFolderName, "Please enter a name for the new folder");
    needNewFolderName = false;

    await folder.createSubFolder(newFolderName);
  }
</script>

<style>
  grid.create-folder {
    grid-template-columns: max-content auto max-content;
    gap: 8px 24px;
    align-items: center;
  }
  .buttons {
    justify-content: end;
  }
  .buttons :global(button) {
    margin-left: 8px;
  }
  .buttons :global(button.delete) {
    background-color: lightsalmon;
    color: black;
  }
</style>
