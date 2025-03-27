<hbox class="account-selector">
  {#if withIcon}
    <hbox class="icon" style="--account-color: {$selectedAccount?.color ?? "black"}">
      <AccountIcon />
    </hbox>
  {/if}
  <select bind:value={selectedAccount} class:withLabel on:change={onSelect}>
    {#each $accounts.each as account }
      <option value={account}>
        {account.name}
      </option>
    {/each}
  </select>
</hbox>

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";
  import type { Collection } from "svelte-collections";
  import AccountIcon from "lucide-svelte/icons/rabbit";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ select: Account }>();

  export let selectedAccount: Account; /* in/out */
  export let accounts: Collection<Account>;
  export let withIcon: boolean = false;
  export let withLabel: boolean = true;

  $: defaultSelection(selectedAccount);
  function defaultSelection(_dummy: any) {
    if (!selectedAccount) {
      selectedAccount = accounts.first;
    }
  }

  $: accounts, onAccountsListChanged();
  function onAccountsListChanged() {
    if (!accounts.includes(selectedAccount)) {
      selectedAccount = accounts.first;
    }
  }

  function onSelect() {
    dispatch("select", selectedAccount);
  }
</script>

<style>
  .account-selector {
    align-items: center;
  }
  select {
    border: none;
    color: inherit;
    background-color: transparent;
  }
  select:not(.withLabel) {
    width: 16px;
    height: 16px;
  }
  .account-selector .icon {
    color: var(--account-color);
  }
</style>
