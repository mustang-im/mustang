<grid class="main">
  <label for="name">Folder name</label>
  <input type="text" bind:value={folderName} name="name" />
  <Button label="Rename"
    classes="create"
    on:click={() => catchErrors(onNameChange)}
    />
</grid>
<hbox flex />
{#if needNewFolderName}
  <grid class="create-folder">
    <label for="new-name">New folder name</label>
    <input type="text" bind:value={newFolderName} name="new-name" />
    <Button label="Create sub-folder"
      classes="create"
      on:click={() => catchErrors(onCreateSubFolder)}
      />
  </grid>
{:else}
  <hbox class="buttons">
    <Button label="Delete folder"
      classes="delete"
      on:click={() => catchErrors(onDelete)}
      />
    <Button label="Create sub-folder"
      classes="create"
      on:click={() => catchErrors(onOpenCreateSubFolder)}
      />
  </hbox>
{/if}

<script lang="ts">
  import type { Folder } from "../../../../logic/Mail/Folder";
  import { SQLFolder } from "../../../../logic/Mail/SQL/SQLFolder";
  import { assert } from "../../../../logic/util/util";
  import Button from "../../../Shared/Button.svelte";
  import { catchErrors } from "../../../Util/error";

  export let folder: Folder;

  $: init($folder);

  let folderName: string;
  function init(_dummy: any) {
    folderName = folder.name;
  }
  async function onNameChange() {
    assert(folderName, "Name cannot be empty");
    await folder.rename(folderName);
    await save();
  }
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

  // $: $folder, catchErrors(save);
  async function save() {
    await SQLFolder.save(folder);
  }
</script>

<style>
  grid.main,
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
  }
</style>
