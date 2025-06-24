<hbox class="account-selector">
  {#if icon}
    <hbox class="icon" style="--account-color: {$selectedAccount?.color ?? "black"}">
      <svelte:component this={icon} />
    </hbox>
  {/if}
  <select bind:value={selectedAccount} class:withLabel on:change={onSelect}>
    {#if showAllOption}
      <option value={null}>
        {$t`All`}
      </option>
    {/if}
    {#each $showAccounts.each as account }
      <option value={account}>
        {account.name}
      </option>
    {/each}
  </select>
</hbox>

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";
  import { selectedWorkspace } from "../MainWindow/Selected";
  import { t } from "../../l10n/l10n";
  import type { Collection } from "svelte-collections";
  import { createEventDispatcher, SvelteComponentTyped } from 'svelte';
  const dispatch = createEventDispatcher<{ select: Account }>();

  export let selectedAccount: Account; /* in/out */
  export let accounts: Collection<Account>;
  export let filterByWorkspace: boolean;
  export let showAllOption: boolean = false;
  export let icon: ConstructorOfATypedSvelteComponent | null = null;
  export let withLabel: boolean = true;

  $: showAccounts = filterByWorkspace && $selectedWorkspace
    ? accounts.filter(acc => acc.workspace == $selectedWorkspace)
    : accounts;

  $: selectedAccount, defaultSelection();
  function defaultSelection() {
    if (!selectedAccount) {
      selectedAccount = showAllOption ? null : showAccounts.first;
    }
  }

  $: showAccounts, onAccountsListChanged();
  function onAccountsListChanged() {
    if (selectedAccount === null && showAllOption) {
      return;
    }
    if (!showAccounts.includes(selectedAccount)) {
      selectedAccount = null;
      defaultSelection();
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
  .account-selector .icon :global(svg) {
    stroke-width: 1.5;
  }
  select {
    overflow-x: hidden;
    text-overflow: ellipsis;
    max-width: 10em;
  }
</style>
