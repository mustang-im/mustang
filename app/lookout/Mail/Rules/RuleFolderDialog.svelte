<Dialog title={$t`Rules and Alerts`} on:close={onCancel} width="400px">
  <vbox class="content">
    <span class="caption">{$t`Choose a folder:`}</span>
    <FolderPicker label={$t`Folders`} bind:selectedFolder={folder}
      disableFolder={candidate => candidate.account != account && $t`Rules can only use folders of the account ${account.name}`}
      on:choose={onOK} />
  </vbox>
  <svelte:fragment slot="footer">
    <DialogButton label={$t`OK`} primary onClick={onOK} disabled={!folder && $t`Select a folder first`} />
    <DialogButton label={$t`Cancel`} onClick={onCancel} />
  </svelte:fragment>
</Dialog>

<script lang="ts">
  import type { Folder } from "../../../logic/Mail/Folder";
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import DialogButton from "../../Shared/Dialog/DialogButton.svelte";
  import FolderPicker from "../Dialogs/FolderPicker.svelte";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;
  export let folder: Folder | null = null;
  export let onChosen: (folder: Folder) => void | Promise<void>;
  export let onCancel: () => void;

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
