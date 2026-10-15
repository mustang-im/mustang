<Dialog title={copy ? $t`Copy Items` : $t`Move Items`}
  okLabel={$t`OK`}
  okDisabled={!target && $t`Select a folder first`}
  onOK={onMove}
  on:close>
  <vbox class="dialog-content">
    <span class="caption">
      {copy ? $t`Copy the selected items to the folder:` : $t`Move the selected items to the folder:`}
    </span>
    <FolderPicker label={$t`Folders`} bind:selectedFolder={target} bind:selectedAccount={targetAccount}
      disableFolder={folder => !copy && MessageActions.isInFolder(messages, folder) && $t`The items are already in this folder`}
      on:choose={onChoose} />
    {#if isCreating}
      <hbox class="new-folder">
        <input type="text" bind:value={newFolderName} placeholder={$t`Name of the new folder`}
          on:keydown={onNewFolderKey} use:focus />
        <button type="button" class="small-button" on:click={() => catchErrors(onCreateFolder)} disabled={!newFolderName?.trim()}>
          {$t`Create`}
        </button>
      </hbox>
    {/if}
  </vbox>
  <button slot="buttons-start" type="button" class="small-button"
    on:click={() => isCreating = true}
    disabled={!targetAccount || isCreating}
    title={target ? $t`Create a subfolder of ${target.name}` : $t`Create a new folder`}>
    {$t`New…`}
  </button>
</Dialog>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { MessageActions } from "../MessageActions";
  import Dialog from "./Dialog.svelte";
  import FolderPicker from "./FolderPicker.svelte";
  import { catchErrors, showError } from "../../../frontend/Util/error";
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let messages: EMail[];
  export let copy = false;

  const dispatch = createEventDispatcher<{ close: void }>();
  let target: Folder | null = null;
  let targetAccount: MailAccount | null = messages[0]?.folder?.account ?? null;

  async function onMove() {
    if (copy) {
      await MessageActions.copyTo(messages, target);
    } else {
      await MessageActions.moveTo(messages, target);
    }
  }

  async function onChoose() {
    try {
      await onMove();
      dispatch("close");
    } catch (ex) {
      showError(ex);
    }
  }

  let isCreating = false;
  let newFolderName = "";
  async function onCreateFolder() {
    let name = newFolderName?.trim();
    if (!name) {
      return;
    }
    let folder = target
      ? await target.createSubFolder(name)
      : await targetAccount.createToplevelFolder(name);
    target = folder;
    isCreating = false;
    newFolderName = "";
  }
  function onNewFolderKey(event: KeyboardEvent) {
    if (event.key == "Enter") {
      event.preventDefault();
      catchErrors(onCreateFolder);
    } else if (event.key == "Escape") {
      event.preventDefault();
      event.stopPropagation();
      isCreating = false;
    }
  }
  function focus(input: HTMLInputElement) {
    input.focus();
  }
</script>

<style>
  .dialog-content {
    gap: 8px;
  }
  .caption {
    color: var(--lo-fg);
  }
  .new-folder {
    gap: 8px;
    align-items: center;
  }
  .new-folder input {
    flex: 1;
    height: 30px;
    padding: 0 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
  }
  .small-button {
    height: 30px;
    padding: 0 12px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
    font: inherit;
    cursor: pointer;
  }
  .small-button:hover:not(:disabled) {
    background-color: var(--lo-hover-bg);
  }
  .small-button:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
