{#if needNewFolderName}
  <grid class="create-folder">
    <label for="new-name">{$t`New folder name`}</label>
    <input type="text" bind:value={newFolderName} name="new-name" />
    <Button label={$t`Create sub-folder`}
      classes="create"
      onClick={onCreateSubFolder}
      />
  </grid>
{:else}
  <hbox class="buttons">
    <Button label={$t`Create sub-folder`}
      classes="create"
      icon={CreateFolderIcon}
      onClick={onOpenCreateSubFolder}
      disabled={folder.disableSubfolders()}
      />
    <slot name="buttons-bottom-right" />
  </hbox>
{/if}

<script lang="ts">
  import type { Folder } from "../../../../logic/Mail/Folder";
  import Button from "../../../Shared/Button.svelte";
  import CreateFolderIcon from "lucide-svelte/icons/folder-plus";
  import { assert } from "../../../../logic/util/util";
  import { t } from "../../../../l10n/l10n";

  export let folder: Folder;

  let newFolderName: string | undefined;
  let needNewFolderName = false;
  function onOpenCreateSubFolder() {
    needNewFolderName = true;
  }

  async function onCreateSubFolder() {
    assert(needNewFolderName, $t`Need folder name`);
    assert(newFolderName, $t`Please enter a name for the new folder`);
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
    margin-inline-start: 8px;
  }
  .buttons :global(button.delete) {
    background-color: lightsalmon;
    color: black;
  }
</style>
