<hbox>
  {#each $accounts.each as acc}
    <hbox class="account" title={acc.name}>
      <RoundButton
        label={acc.name}
        selected={acc == selectedAccount}
        on:click={() => onSelect(acc)}
        icon={acc.icon ?? icon}
        border={false}
      />
    </hbox>
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
  export let icon: ComponentType | string;

  function onSelect(acc: Account) {
    selectedAccount = acc;
    dispatch("select", acc);
  }
</script>

<style>
  .account {
    margin-inline-end: 6px;
  }
</style>
