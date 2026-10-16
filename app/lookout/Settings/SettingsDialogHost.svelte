{#if $dialog?.kind == "options"}
  <OptionsDialog category={$dialog.category} on:close={onClose} />
{:else if $dialog?.kind == "trust-center"}
  <TrustCenterDialog page={$dialog.page} identity={$dialog.identity} on:close={onClose} />
{:else if $dialog?.kind == "account-settings"}
  <AccountSettingsDialog tab={$dialog.tab} on:close={onClose} />
{:else if $dialog?.kind == "change-account"}
  <ChangeAccountDialog account={$dialog.account} page={$dialog.page} on:close={onClose} />
{:else if $dialog?.kind == "import-export"}
  {#key $dialog}
    <ImportExportWizard preselected={$dialog.preselected} action={$dialog.action} firstRun={$dialog.firstRun} on:close={onClose} />
  {/key}
{:else if $dialog?.kind == "add-account"}
  {#key $dialog}
    <AddAccountDialog prepared={$dialog.prepared} firstRun={$dialog.firstRun} on:close={onClose} />
  {/key}
{:else if $dialog?.kind == "new-folder-account"}
  <NewFolderAccountDialog kind={$dialog.folderKind} localOnly={$dialog.localOnly} on:close={onClose} />
{/if}
<CalendarDialogHost />
<ContactDialogHost />

<script lang="ts">
  import { SettingsDialogs } from "./SettingsDialogs";
  import OptionsDialog from "./Options/OptionsDialog.svelte";
  import TrustCenterDialog from "./Options/TrustCenterDialog.svelte";
  import AccountSettingsDialog from "./Accounts/AccountSettingsDialog.svelte";
  import ChangeAccountDialog from "./Accounts/ChangeAccountDialog.svelte";
  import ImportExportWizard from "./ImportExport/ImportExportWizard.svelte";
  import AddAccountDialog from "./Accounts/AddAccountDialog.svelte";
  import NewFolderAccountDialog from "./Accounts/NewFolderAccountDialog.svelte";
  import CalendarDialogHost from "../Calendar/Dialogs/CalendarDialogHost.svelte";
  import ContactDialogHost from "../Contacts/Dialogs/ContactDialogHost.svelte";

  const dialog = SettingsDialogs.current;

  function onClose() {
    SettingsDialogs.close();
  }
</script>
