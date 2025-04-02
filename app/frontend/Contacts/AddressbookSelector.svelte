<AccountSelectorRound
  {accounts}
  bind:selectedAccount={selectedAddressbook}
  showAllOption={true}
  iconDefault={AddressbookIcon}
  on:select
  />

<script lang="ts">
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import { selectedWorkspace } from "../MainWindow/Selected";
  import { appGlobal } from "../../logic/app";
  import AccountSelectorRound from "../Shared/AccountSelectorRound.svelte";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import CollectedIcon from "lucide-svelte/icons/history";

  /** in/out */
  export let selectedAddressbook: Addressbook;

  $: accounts = appGlobal.addressbooks.filter(acc => acc.workspace == $selectedWorkspace || !$selectedWorkspace);

  if (appGlobal?.collectedAddressbook && !appGlobal?.collectedAddressbook?.icon) {
    appGlobal.collectedAddressbook.icon = CollectedIcon;
  }
</script>
