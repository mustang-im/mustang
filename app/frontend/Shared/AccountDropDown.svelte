<hbox class="account-selector">
  <select bind:value={selectedAccount}>
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

  export let selectedAccount: Account; /* in/out */
  export let accounts: Collection<Account>;

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
</script>

<style>
  .account-selector :global(select) {
    border: none;
    color: inherit;
    background-color: transparent;
  }
</style>
