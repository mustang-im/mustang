<vbox class="account-list">
  <FastList items={accounts} bind:selectedItem={selectedAccount} columns="1fr">
    <svelte:fragment slot="header">
      <hbox class="header">
        <hbox class="header-label">{$t`Accounts`}</hbox>
        <hbox flex />
        <slot name="top-right" />
      </hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={account}>
      <AccountListItem {account} />
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import AccountListItem from "./AccountListItem.svelte";
  import FastList from "../../Shared/FastList.svelte";
  import type { Collection } from 'svelte-collections';
  import { t } from "svelte-i18n-lingui";

  export let accounts: Collection<MailAccount>;
  export let selectedAccount: MailAccount; /* in/out */
</script>

<style>
  .account-list :global(.fast-list) {
    overflow: inherit;
  }
  .account-list :global(.row hbox) {
    font-size: 14px;
  }
  .header {
    align-items: end;
    margin-top: 8px;
    margin-left: 4px;
  }
  .header-label {
    color: grey;
    font-size: 12px;
  }
  .header :global(button) {
    margin-left: 4px;
  }
</style>
