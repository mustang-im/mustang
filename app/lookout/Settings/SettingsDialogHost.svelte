{#if $dialog?.kind == "options" || $dialog?.kind == "account"}
  {#key $dialog}
    <SettingsApp categoryID={$dialog.categoryID} account={$dialog.account} showOnlyAccount={$dialog.kind == "account"} on:close={onClose} />
  {/key}
{:else if $dialog?.kind == "import-export"}
  {#key $dialog}
    <ImportExportWizard preselected={$dialog.preselected} action={$dialog.action} on:close={onClose} />
  {/key}
{:else if $dialog?.kind == "new-folder-account"}
  <NewFolderAccountDialog kind={$dialog.folderKind} localOnly={$dialog.localOnly} on:close={onClose} />
{/if}
<CalendarDialogHost />
<ContactDialogHost />

<script lang="ts">
  import { SettingsDialogs } from "./SettingsDialogs";
  import SettingsApp from "./Window/SettingsApp.svelte";
  import ImportExportWizard from "./ImportExport/ImportExportWizard.svelte";
  import NewFolderAccountDialog from "../Setup/NewFolderAccountDialog.svelte";
  import CalendarDialogHost from "../Calendar/Dialogs/CalendarDialogHost.svelte";
  import ContactDialogHost from "../Contacts/Dialogs/ContactDialogHost.svelte";

  const dialog = SettingsDialogs.current;

  function onClose() {
    SettingsDialogs.close();
  }
</script>
