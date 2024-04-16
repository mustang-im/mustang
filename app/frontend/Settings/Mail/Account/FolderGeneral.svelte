<grid class="main">
  <label for="name">Folder name</label>
  <input type="text" bind:value={folderName} name="name" />
  <Button label="Rename"
    classes="create"
    on:click={() => catchErrors(onNameChange)}
    />

  <label for="count">Messages</label>
  <hbox class="value" name="count">{folder.countNewArrived} new, {folder.countUnread} unread, {folder.countTotal} total messages</hbox>
  <hbox></hbox>
</grid>

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

  async function save() {
    await SQLFolder.save(folder);
  }
</script>

<style>
  grid.main {
    grid-template-columns: max-content auto max-content;
    gap: 8px 24px;
    align-items: center;
  }
</style>
