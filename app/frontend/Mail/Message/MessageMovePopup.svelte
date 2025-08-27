<vbox class="message-popup">
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
    <slot name="buttons" {messages} />
    <Button plain
      label={$t`Close`}
      onClick={onClose}
      iconOnly
      icon={CloseIcon}
      />
  </hbox>
  {#if !showAccounts}
    <vbox class="tags">
      <hbox class="header font-smallest">{$t`Tags`}</hbox>
      <!-- TODO make work with multiple selected messages -->
      <TagSelector
        tags={availableTags}
        selectedTags={messages.first.tags}
        object={messages.first}
        on:select={onClose}
        on:unselect={onClose}
        />
    </vbox>
  {/if}
  {#if showAccounts}
    <vbox class="accounts">
      <AccountList accounts={appGlobal.emailAccounts} bind:selectedAccount />
    </vbox>
  {/if}
  <vbox class="folders">
    <FolderList folders={selectedAccount.rootFolders} bind:selectedFolder bind:selectedFolders>
      <svelte:fragment slot="buttons" let:folder>
        {#if folder != sourceFolder}
          <Button plain
            label={$t`Copy`}
            tooltip={$t`Copy this email to folder ${folder.name}`}
            onClick={() => onCopyTo(folder)}
            icon={CopyIcon}
            iconOnly
            />
          <Button plain
            label={$t`Move`}
            tooltip={$t`Move this email to folder ${folder.name}`}
            onClick={() => onMoveTo(folder)}
            icon={MoveIcon}
            />
        {/if}
      </svelte:fragment>
      <svelte:fragment slot="header">
        <hbox class="folders-header" flex>
          {$t`Folder`}
          <hbox flex />
          <Button
            label={$t`Move to other mail account`}
            icon={AccountsIcon}
            iconOnly
            plain
            selected={showAccounts}
            onClick={() => showAccounts = !showAccounts}
           />
        </hbox>
      </svelte:fragment>
    </FolderList>
  </vbox>
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Folder } from "../../../logic/Mail/Folder";
  import { availableTags } from "../../../logic/Abstract/Tag";
  import { appGlobal } from "../../../logic/app";
  import TagSelector from "../../Shared/Tag/TagSelector.svelte";
  import AccountList from "../LeftPane/AccountList.svelte";
  import FolderList from "../LeftPane/FolderList.svelte";
  import Button from "../../Shared/Button.svelte";
  import DeleteIcon from "lucide-svelte/icons/trash-2";
  import SpamIcon from "lucide-svelte/icons/shield-x";
  import ArchiveIcon from "lucide-svelte/icons/archive";
  import MoveIcon from "lucide-svelte/icons/folder-input";
  import CopyIcon from "lucide-svelte/icons/mails";
  import AccountsIcon from "lucide-svelte/icons/share";
  import CloseIcon from "lucide-svelte/icons/x";
  import { ArrayColl, Collection } from "svelte-collections";
  import { t } from "../../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ close: void }>();

  export let messages: Collection<EMail>;
  /** out */
  export let selectedMessage: EMail;

  let sourceFolder = messages.first.folder;
  let selectedFolder = sourceFolder;
  let selectedFolders = new ArrayColl<Folder>();
  let selectedAccount = sourceFolder.account;
  let showAccounts = false;

  function onClose() {
    dispatch("close");
  }

  async function onDelete() {
    onClose();
    for (let message of messages) {
      await message.deleteMessage();
    }
    goToNextMessage();
  }
  async function onSpam() {
    onClose();
    for (let message of messages) {
      await message.treatSpam();
    }
    goToNextMessage();
  }

  async function onArchive() {
    onClose();
    for (let message of messages) {
      await message.moveToArchive();
    }
    goToNextMessage();
  }
  async function onMoveTo(folder: Folder) {
    onClose();
    await folder.moveMessagesHere(messages);
    goToNextMessage();
  }
  async function onCopyTo(folder: Folder) {
    onClose();
    await folder.copyMessagesHere(messages);
  }

  function goToNextMessage() {
    let last: EMail = null;
    while (selectedMessage && messages.contains(selectedMessage) && last != selectedMessage) {
      last = selectedMessage;
      selectedMessage = selectedMessage.nextMessage(); // fails, because it's already been removed from the folder
    }
    selectedMessage ??=
      last.folder.messages.filterOnce(msg => !msg.isRead).last ??
      last.folder.messages.last ??
      messages.first; // selectedMessage must not be null
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
  .accounts {
    height: 10em;
  }
  .accounts :global(.account-list) {
    flex: 1;
  }
  .folders {
    height: 22em;
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
  /* TODO fix colors on hover
  .buttons > :global(.selected button:hover:not(.disabled)) {
    background-color: unset;
    color: green;
  }*/
</style>
