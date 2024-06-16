<AccountSelectorRound
  accounts={appGlobal.addressbooks}
  bind:selectedAccount={selectedAddressbook}
  icon={AddressbookIcon}
  on:select
  />

<script lang="ts">
  import type { Addressbook } from "../../logic/Contacts/Addressbook";
  import { appGlobal } from "../../logic/app";
  import AccountSelectorRound from "../Shared/AccountSelectorRound.svelte";
  import AddressbookIcon from "lucide-svelte/icons/book-user";
  import CollectedIcon from "lucide-svelte/icons/history";

  /** in/out */
  export let selectedAddressbook: Addressbook;

  if (appGlobal?.collectedAddressbook?.icon) {
    appGlobal.collectedAddressbook.icon = CollectedIcon;
  }
</script>
