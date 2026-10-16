{#if $dialog?.kind == "addressbook-properties"}
  <AddressBookPropertiesDialog addressbook={$dialog.addressbook} on:close={onClose} />
{:else if $dialog?.kind == "rename-addressbook"}
  <RenameDialog account={$dialog.addressbook} title={$t`Rename Folder`} on:close={onClose} />
{/if}

<script lang="ts">
  import { ContactDialogs } from "./ContactDialogs";
  import AddressBookPropertiesDialog from "./AddressBookPropertiesDialog.svelte";
  import RenameDialog from "../../Settings/Accounts/RenameDialog.svelte";
  import { t } from "../../../l10n/l10n";

  const dialog = ContactDialogs.current;

  function onClose() {
    ContactDialogs.close();
  }
</script>
