{#if $dialog?.kind == "options"}
  <OptionsDialog category={$dialog.category} on:close={onClose} />
{:else if $dialog?.kind == "account-settings"}
  <AccountSettingsDialog tab={$dialog.tab} on:close={onClose} />
{:else if $dialog?.kind == "change-account"}
  <ChangeAccountDialog account={$dialog.account} page={$dialog.page} on:close={onClose} />
{/if}

<script lang="ts">
  import { SettingsDialogs } from "./SettingsDialogs";
  import OptionsDialog from "./Options/OptionsDialog.svelte";
  import AccountSettingsDialog from "./Accounts/AccountSettingsDialog.svelte";
  import ChangeAccountDialog from "./Accounts/ChangeAccountDialog.svelte";

  const dialog = SettingsDialogs.current;

  function onClose() {
    SettingsDialogs.close();
  }
</script>
