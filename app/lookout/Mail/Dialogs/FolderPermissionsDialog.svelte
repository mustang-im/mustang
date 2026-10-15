<Dialog title={$t`Permissions`}
  cancelLabel={$t`Close`}
  width="640px"
  on:close>
  <vbox class="dialog-content">
    <span class="caption">{$t`Colleagues who can access the folders of ${account.name}`}</span>
    <SharingOutgoing {account} />
  </vbox>
</Dialog>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import SharingOutgoing from "../../../frontend/Settings/Mail/SharingOutgoing.svelte";
  import Dialog from "../../Shared/Dialog/Dialog.svelte";
  import { t } from "../../../l10n/l10n";

  export let account: MailAccount;
</script>

<style>
  .dialog-content {
    gap: 12px;
    min-height: 240px;
  }
</style>
