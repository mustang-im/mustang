{#if $dialog?.kind == "addressbook-properties"}
  <AddressBookPropertiesDialog addressbook={$dialog.addressbook} on:close={onClose} />
{:else if $dialog?.kind == "rename-addressbook"}
  <RenameDialog account={$dialog.addressbook} title={$t`Rename Folder`} on:close={onClose} />
{:else if $dialog?.kind == "show-columns"}
  <ShowColumnsDialog columns={ContactColumns.shownColumns(ContactColumns.columnsSetting($dialog.view).value)}
    allColumns={ContactColumns.allColumns} labelOf={ContactColumns.label}
    requiredColumn={ContactColumn.FullName} requiredReason={$t`The list needs the Full Name column`}
    columnSets={ContactColumns.columnSets()}
    onOK={columns => $dialog?.kind == "show-columns" && ContactColumns.setColumns($dialog.view, columns)} on:close={onClose} />
{:else if $dialog?.kind == "view-settings"}
  <ContactViewSettingsDialog view={$dialog.view} on:close={onClose} />
{/if}

<script lang="ts">
  import { ContactDialogs } from "./ContactDialogs";
  import AddressBookPropertiesDialog from "./AddressBookPropertiesDialog.svelte";
  import RenameDialog from "../../Settings/Shared/RenameDialog.svelte";
  import ShowColumnsDialog from "../../Calendar/ViewSettings/ShowColumnsDialog.svelte";
  import ContactViewSettingsDialog from "../Views/ContactViewSettingsDialog.svelte";
  import { ContactColumn, ContactColumns } from "../Views/ContactColumns";
  import { t } from "../../../l10n/l10n";

  const dialog = ContactDialogs.current;

  function onClose() {
    ContactDialogs.close();
  }
</script>
