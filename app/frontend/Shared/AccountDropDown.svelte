<hbox class="account-selector">
  <NativeSelect
      data={accountOptions}
      bind:value={accountID}
      on:change={onChange}
  />
</hbox>

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";
  import { NativeSelect } from '@svelteuidev/core';
  import type { Collection } from "svelte-collections";

  export let selectedAccount: Account; /* in/out */
  export let accounts: Collection<Account>;

  $: accountOptions = $accounts.contents.map(account => ({
    value: account.id,
    label: account.name,
  }));
  $: console.log("accounts", $accounts.contents, accountOptions);

  $: accountID = selectedAccount?.id ?? $accounts.first?.id;

  function onChange(event) {
    console.log("accounts dropdown value changed", event);
    selectedAccount = accounts.contents.find(account => account.id == accountID);
  }
</script>

<style>
  .account-selector :global(select) {
    border: none;
    background-color: transparent;
  }
</style>
