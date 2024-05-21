<grid class="main">
  <label for="name">Folder name</label>
  <input type="text" bind:value={folderName} name="name" />
  <Button label="Rename"
    classes="create"
    onClick={onNameChange}
    />

  <label for="count">Use as</label>
  <SpecialFolderDropDown bind:specialFolderType={folder.specialFolder} disabled={disableSpecial} />
  <Button label="Save"
    onClick={onChangeSpecialFolder}
    disabled={disableSpecial}
    />

  <label for="count">Messages</label>
  <hbox class="value" name="count">
    {#if $folder.countTotal > 0}
      {$folder.countNewArrived} new,
      {$folder.countUnread} unread,
      {$folder.countTotal} total messages.
    {/if}
    {#if $folder.countTotal > 0 && $folder.countTotal == $messages.length}
      All downloaded.
    {:else if $messages.length > 0}
      {$messages.length} local messages.
    {/if}
  </hbox>
  <Button label="Mark all read"
    onClick={onMarkAllRead}
    />
</grid>

<script lang="ts">
  import type { Folder } from "../../../../logic/Mail/Folder";
  import { SQLFolder } from "../../../../logic/Mail/SQL/SQLFolder";
  import SpecialFolderDropDown from "./SpecialFolderDropDown.svelte";
  import Button from "../../../Shared/Button.svelte";
  import { assert } from "../../../../logic/util/util";

  export let folder: Folder;

  $: init($folder);

  $: messages = $folder.messages;
  $: disableSpecial = $folder.disableChangeSpecial();

  let folderName: string;
  function init(_dummy: any) {
    folderName = folder.name;
  }
  async function onNameChange() {
    assert(folderName, "Name cannot be empty");
    await folder.rename(folderName);
    await save();
  }

  async function onMarkAllRead() {
    await folder.markAllRead();
  }

  async function onChangeSpecialFolder() {
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
