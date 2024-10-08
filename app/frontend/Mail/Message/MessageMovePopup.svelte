<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox class="message-popup" on:click={onClickInside}>
  <hbox class="top buttons">
    <Button plain
      label={$t`Delete`}
      onClick={onDelete}
      icon={DeleteIcon}
      />
    <Button plain
      label={$t`Spam`}
      tooltip={$t`Treat this email as spam: Move it to the Spam folder, and train the spam filter`}
      onClick={onSpam}
      icon={SpamIcon}
      />
    <Button plain
      label={$t`Archive`}
      tooltip={$t`Move this email to the archive folder`}
      onClick={onArchive}
      icon={ArchiveIcon}
      iconOnly
      />
    <slot name="buttons" {message} />
    <Button plain
      label={$t`Close`}
      onClick={onClose}
      iconOnly
      icon={CloseIcon}
      />
  </hbox>
  <vbox class="tags">
    <hbox class="header">{$t`Tags`}</hbox>
    <TagSelector
      tags={availableTags}
      selectedTags={message.tags}
      {message}
      on:select={onClose}
      on:unselect={onClose}
      />
  </vbox>
  <vbox class="folders">
    <FolderList folders={availableFolders} bind:selectedFolder bind:selectedFolders />
  </vbox>
  <hbox class="bottom buttons">
    <hbox flex />
    <Button plain
      label={$t`Copy`}
      tooltip={$t`Copy this email to folder ${selectedFolder.name}`}
      onClick={onCopy}
      icon={CopyIcon}
      iconOnly
      disabled={selectedFolder == message.folder}
      />
    <Button plain
      label={$t`Move`}
      tooltip={$t`Move this email to folder ${selectedFolder.name}`}
      onClick={onMove}
      icon={MoveIcon}
      disabled={selectedFolder == message.folder}
      />
  </hbox>
</vbox>
<svelte:window on:click={onClickOutside} />

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Folder } from "../../../logic/Mail/Folder";
  import { availableTags } from "../../../logic/Mail/Tag";
  import TagSelector from "../Tag/TagSelector.svelte";
  import FolderList from "../LeftPane/FolderList.svelte";
  import Button from "../../Shared/Button.svelte";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import ArchiveIcon from "lucide-svelte/icons/archive";
  import MoveIcon from "lucide-svelte/icons/folder-input";
  import CopyIcon from "lucide-svelte/icons/mails";
  import CloseIcon from "lucide-svelte/icons/x";
  import { ArrayColl } from "svelte-collections";
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ close: void }>();

  export let message: EMail;

  let availableFolders = message.folder.account.rootFolders;
  let selectedFolder = message.folder;
  let selectedFolders = new ArrayColl<Folder>();

  function onClose() {
    dispatch("close");
  }
  function onClickInside(event: MouseEvent) {
    event.stopPropagation();
  }
  function onClickOutside(event: MouseEvent) {
    onClose();
  }

  async function onDelete() {
    onClose();
    await message.deleteMessage();
  }
  async function onSpam() {
    onClose();
    await message.treatSpam();
  }

  async function onArchive() {
    onClose();
    await message.moveToArchive();
  }
  async function onMove() {
    onClose();
    await selectedFolder.moveMessageHere(message);
  }
  async function onCopy() {
    onClose();
    await selectedFolder.copyMessageHere(message);
  }
</script>

<style>
  .message-popup {
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
  }
  .message-popup :global(.header) {
    display: flex !important;
    height: unset !important;
  }
  .header {
    color: grey;
    font-size: 12px;
  }
  .header,
  .message-popup :global(grid > .header) {
    margin-block-start: 0px;
    margin-block-end: 4px;
  }
  .tags {
    margin: 10px;
    max-width: 300px;
  }
  .folders {
    height: 20em;
  }
  .buttons {
    border-top: 1px solid var(--border);
  }
  .buttons > :global(button:not(:first-child)) {
    border-left: 1px solid var(--border);
  }
  .buttons > :global(button) {
    padding: 8px 16px;
    border-radius: 0px;
  }
</style>
