<vbox class="saved-search">
  <input type="text" bind:value={name} placeholder={$t`Name of the folder`} class="font-normal" />
  <hbox class="buttons">
    <Button
      icon={SaveIcon}
      label={$t`Save as folder`}
      onClick={onSave}
    />
  </hbox>
</vbox>

<script lang="ts">
  import type { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
  import { SavedSearchFolder } from "../../../logic/Mail/Virtual/SavedSearchFolder";
  import { selectedAccount, selectedFolder } from "../Selected";
  import { allAccountsAccount } from "../../../logic/Mail/AccountsList/ShowAccounts";
  import Button from "../../Shared/Button.svelte";
  import SaveIcon from "lucide-svelte/icons/save";
  import { createEventDispatcher } from 'svelte';
  import { t } from "../../../l10n/l10n";
  const dispatchEvent = createEventDispatcher();

  /** in */
  export let search: SearchEMail;

  let name: string;

  async function onSave() {
    let folder = new SavedSearchFolder(search.clone());
    folder.name = name;
    await folder.save();

    $selectedAccount = allAccountsAccount;
    $selectedFolder = folder;
    dispatchEvent("close");
  }
</script>

<style>
  input {
    margin: 12px;
    padding: 2px 4px;
  }
  .buttons {
    margin: 12px;
    justify-content: end;
  }
</style>
