<Dialog title={$t`Create New Folder`}
  okLabel={$t`OK`}
  okDisabled={!name?.trim() && $t`Enter a name`}
  onOK={onCreate}
  on:close>
  <vbox class="dialog-content">
    <label for="new-folder-name">{$t`Name:`}</label>
    <input id="new-folder-name" class="lo-text-field" type="text" bind:value={name} />
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
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
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

</script>

<style>
  .dialog-content {
    gap: 6px;
  }
  .caption {
    margin-block-start: 8px;
  }
</style>
