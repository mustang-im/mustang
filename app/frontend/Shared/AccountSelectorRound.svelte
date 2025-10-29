<hbox class="accounts">
  {#if showAllOption}
    <vbox class="account" title={$t`All`}
      on:click={() => onSelect(null)}
      >
      <hbox>
        <RoundButton
          label={$t`All`}
          selected={selectedAccount == null}
          onClick={() => onSelect(null)}
          icon={iconDefault}
          border={false}
        />
      </hbox>
      <div class="name font-smallest">{$t`All`}</div>
    </vbox>
  {/if}
  {#each $accounts.each as acc}
    <vbox class="account" title={acc.name}
      on:click={() => onSelect(acc)}
      style="--account-color: {acc.color}"
      >
      <hbox>
        <RoundButton
          label={acc.name}
          selected={acc == selectedAccount}
          onClick={() => onSelect(acc)}
          icon={acc.icon ?? iconDefault}
          classes={acc.icon ? "has-logo" : "default-icon"}
          {iconSize}
          border={false}
        />
      </hbox>
      <div class="name font-smallest" title={acc.name}>{acc.name}</div>
    </vbox>
  {/each}
</hbox>

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";
  import RoundButton from "./RoundButton.svelte";
  import type { Collection } from "svelte-collections";
  import type { ComponentType } from "svelte";
  import { t } from "../../l10n/l10n";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ select: Account }>();

  /** in */
  export let accounts: Collection<Account>;
  /** Shows an additional account "All". If chosen, selectedAccount will be null */
  export let showAllOption = false;
  /** in/out */
  export let selectedAccount: Account;
  export let iconDefault: ComponentType | string;
  export let iconSize: string = undefined;

  function onSelect(acc: Account) {
    selectedAccount = acc;
    dispatch("select", acc);
  }

  $: accounts, onAccountsListChanged();
  function onAccountsListChanged() {
    if (!accounts.includes(selectedAccount)) {
      selectedAccount = accounts.first;
    }
  }
</script>

<style>
  .accounts {
    flex-wrap: wrap;
  }
  .account {
    align-items: center;
    margin-inline-end: 6px;
    width: 60px;
    padding: 8px;
  }
  .account :global(svg) {
    stroke-width: 1.4px;
  }
  .account :global(button.default-icon svg) {
    color: var(--account-color);
  }
  .account :global(button) {
    border: 2px solid var(--account-color) !important;
  }
  .name {
    text-align: center;
    overflow: hidden;
    text-overflow: clip;
    max-height: 18px;
  }
</style>
