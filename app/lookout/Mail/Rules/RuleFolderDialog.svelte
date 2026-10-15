<Dialog title={$t`Rules and Alerts`} bind:this={dialog}
  okLabel={$t`OK`}
  okDisabled={!folder && $t`Select a folder first`}
  onOK={onOK}
  on:close={onCancel} width="400px">
  <vbox class="content">
    <span class="caption">{$t`Choose a folder:`}</span>
    <FolderPicker label={$t`Folders`} bind:selectedFolder={folder}
      disableFolder={candidate => candidate.account != account && $t`Rules can only use folders of the account ${account.name}`}
      on:choose={() => dialog.submit()} />
  </vbox>
</Dialog>

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import FolderPicker from "../Dialogs/FolderPicker.svelte";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;
  export let folder: Folder | null = null;
  export let onChosen: (folder: Folder) => void | Promise<void>;
  export let onCancel: () => void;

  let dialog: Dialog;

  async function onOK() {
    if (!folder) {
      return;
    }
    await onChosen(folder);
  }
</script>

<style>
  .content {
    gap: 6px;
  }
  .caption {
    color: var(--lo-fg-secondary);
  }
</style>
