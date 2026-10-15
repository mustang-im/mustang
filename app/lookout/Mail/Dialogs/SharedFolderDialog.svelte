<Dialog title={$t`Open Shared Folder`}
  cancelLabel={$t`Close`}
  width="600px"
  on:close>
  <vbox class="dialog-content">
    <span class="caption">{$t`Open the folders that your colleagues shared with ${account.name}. They then appear as their own account in the folder pane.`}</span>
    <SharingIncoming {account} />
  </vbox>
</Dialog>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import SharingIncoming from "../../../frontend/Settings/Mail/SharingIncoming.svelte";
  import Dialog from "./Dialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;
</script>

<style>
  .dialog-content {
    gap: 12px;
    min-height: 240px;
  }
</style>
