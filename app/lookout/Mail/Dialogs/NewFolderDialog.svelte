<Dialog title={$t`Create New Folder`}
  okLabel={$t`OK`}
  okDisabled={!name?.trim() && $t`Enter a name`}
  onOK={onCreate}
  on:close>
  <vbox class="dialog-content">
    <label for="new-folder-name">{$t`Name:`}</label>
    <input id="new-folder-name" type="text" bind:value={name} use:focus />
    <span class="caption">{$t`Select where to place the folder:`}</span>
    <FolderPicker label={$t`Folders`} allowAccount
      bind:selectedFolder={parent} bind:selectedAccount={account}
      disableFolder={folder => folder.disableSubfolders()} />
  </vbox>
</Dialog>

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { selectedAccount, selectedFolder } from "../../../frontend/Mail/Selected";
  import { MailView } from "../MailView";
  import Dialog from "./Dialog.svelte";
  import FolderPicker from "./FolderPicker.svelte";
  import { assert } from "../../../logic/util/util";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;
  export let parent: Folder | null = null;

  let name = "";

  async function onCreate() {
    assert(account, $t`Select where to place the folder`);
    let folder = parent
      ? await parent.createSubFolder(name.trim())
      : await account.createToplevelFolder(name.trim());
    if (parent) {
      MailView.setFolderExpanded(parent, true);
    }
    $selectedAccount = folder.account;
    $selectedFolder = folder;
  }

  function focus(input: HTMLInputElement) {
    input.focus();
  }
</script>

<style>
  .dialog-content {
    gap: 6px;
  }
  .caption {
    margin-block-start: 8px;
  }
  input {
    height: 32px;
    padding: 0 8px;
    border: 1px solid var(--lo-input-border);
    border-radius: var(--lo-radius-small);
    background-color: var(--lo-input-bg);
    color: var(--lo-fg);
    font: inherit;
  }
  input:focus {
    outline: none;
    border-color: var(--lo-accent);
    box-shadow: inset 0 -1px 0 var(--lo-accent);
  }
</style>
