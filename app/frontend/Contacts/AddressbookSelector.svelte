<!--
SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>

SPDX-License-Identifier: EUPL-1.2
-->

<AccountSelectorRound
  accounts={appGlobal.addressbooks}
  bind:selectedAccount={selectedAddressbook}
  iconDefault={AddressbookIcon}
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

  if (appGlobal?.collectedAddressbook && !appGlobal?.collectedAddressbook?.icon) {
    appGlobal.collectedAddressbook.icon = CollectedIcon;
  }
</script>
