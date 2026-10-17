<Dialog title={copy ? $t`Copy Items` : $t`Move Items`} bind:this={dialog}
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
      on:choose={() => dialog.submit()} />
  </vbox>
  <svelte:fragment slot="buttons-start">
    <DialogButton label={$t`New…`} onClick={() => { isCreating = true; }}
      disabled={!targetAccount && $t`Select an account or a folder first`}
      tooltip={target ? $t`Create a subfolder of ${target.name}` : $t`Create a new folder`} />
  </svelte:fragment>
</Dialog>
{#if isCreating}
  <NewFolderDialog account={targetAccount} parent={target}
    onCreated={folder => { target = folder; targetAccount = folder.account; }}
    on:close={() => { isCreating = false; }} />
{/if}

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import { MessageActions } from "../MessageActions";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import FolderPicker from "../LeftPane/FolderPicker.svelte";
  import NewFolderDialog from "../LeftPane/NewFolderDialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let messages: EMail[];
  export let copy = false;

  let dialog: Dialog;
  let target: Folder | null = null;
  let targetAccount: MailAccount | null = messages[0]?.folder?.account ?? null;

  async function onMove() {
    if (copy) {
      await MessageActions.copyTo(messages, target);
    } else {
      await MessageActions.moveTo(messages, target);
    }
  }

  let isCreating = false;
</script>

<style>
  .dialog-content {
    gap: 8px;
  }
  .caption {
    color: var(--lo-fg);
  }
</style>
