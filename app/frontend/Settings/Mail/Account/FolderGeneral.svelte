<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<grid class="main">
  <label for="name">{$t`Folder name`}</label>
  <input type="text" bind:value={folderName} name="name" readonly={!!disableRename} />
  <Button label={$t`Rename`}
    classes="create"
    onClick={onNameChange}
    disabled={disableRename}
    />

  <label for="count">{$t`Use as`}</label>
  <SpecialFolderDropDown bind:specialFolderType={folder.specialFolder} disabled={disableSpecial} />
  <Button label={$t`Save`}
    onClick={onChangeSpecialFolder}
    disabled={disableSpecial}
    />

    <label for="count">{$t`Messages`}</label>
  <hbox class="value" name="count">
    {#if $folder.countTotal > 0}
      {$t`${$folder.countNewArrived} new,
          ${$folder.countUnread} unread,
          ${$folder.countTotal} total messages.`}
    {/if}
    {#if $folder.countTotal > 0 && $folder.countTotal != $messages.length}
      {#if $messages.length == 0}
        {$t`Not opened yet.`}
      {:else}
        {$t`${$messages.length} displayed.`}
      {/if}
    {/if}
    {#if $folder.countTotal > 0 && $folder.countTotal == $downloadedMessages.length}
      {$t`All downloaded.`}
    {:else if $downloadedMessages.length > 0}
      {$t`${$downloadedMessages.length} downloaded messages.`}
    {/if}
  </hbox>
  <hbox />

  <hbox />
  <hbox class="buttons">
    <Button label={$t`Get new messages`}
      onClick={onGetNew}
      />
    <Button label={$t`Download all messages`}
      onClick={onDownloadAll}
      />
    <Button label={$t`Mark all read`}
      onClick={onMarkAllRead}
      />
  </hbox>
</grid>

<script lang="ts">
  import type { Folder } from "../../../../logic/Mail/Folder";
  import SpecialFolderDropDown from "./SpecialFolderDropDown.svelte";
  import Button from "../../../Shared/Button.svelte";
  import { assert } from "../../../../logic/util/util";
  import { t } from "../../../../l10n/l10n";

  export let folder: Folder;

  $: init($folder);

  $: messages = $folder.messages;
  $: downloadedMessages = $messages.filter(msg => msg.downloadComplete);
  $: disableSpecial = $folder.disableChangeSpecial();
  $: disableRename = $folder.disableRename();

  let folderName: string;
  function init(_dummy: any) {
    folderName = folder.name;
  }
  async function onNameChange() {
    assert(folderName, $t`Name cannot be empty`);
    await folder.rename(folderName);
    await save();
  }

  async function onGetNew() {
    await folder.getNewMessages();
  }

  async function onDownloadAll() {
    await folder.listMessages();
    await folder.downloadAllMessages();
  }

  async function onMarkAllRead() {
    await folder.markAllRead();
  }

  async function onChangeSpecialFolder() {
    await save();
  }

  async function save() {
    await folder.save();
  }
</script>

<style>
  grid.main {
    grid-template-columns: max-content auto max-content;
    gap: 8px 24px;
    align-items: center;
  }
  label {
    height: 100%;
  }
  .buttons {
    flex-wrap: wrap;
  }
  .buttons :global(button) {
    margin-inline-end: 6px;
    margin-block-end: 6px;
  }
  input[readonly] {
    opacity: 70%;
  }
</style>
