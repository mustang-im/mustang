<hbox class="accounts">
  {#each $accounts.each as acc}
    <vbox class="account" title={acc.name}
      on:click={() => onSelect(acc)}
      >
      <hbox>
        <RoundButton
          label={acc.name}
          selected={acc == selectedAccount}
          on:click={() => onSelect(acc)}
          icon={acc.icon ?? iconDefault}
          border={false}
        />
      </hbox>
      <div class="name" title={acc.name}>{acc.name}</div>
    </vbox>
  {/each}
</hbox>

<script lang="ts">
  import type { Account } from "../../logic/Abstract/Account";
  import RoundButton from "./RoundButton.svelte";
  import type { Collection } from "svelte-collections";
  import type { ComponentType } from "svelte";
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  /** in */
  export let accounts: Collection<Account>;
  /** in/out */
  export let selectedAccount: Account;
  export let iconDefault: ComponentType | string;

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
    width: 48px;
  }
  .name {
    font-size: 10px;
    text-align: center;
    overflow: hidden;
    text-overflow: clip;
    max-height: 18px;
  }
</style>
