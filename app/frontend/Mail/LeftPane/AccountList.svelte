<vbox class="account-list">
  <FastList items={accounts} bind:selectedItem={selectedAccount} columns="1fr">
    <svelte:fragment slot="header">
      <hbox class="header">
        <hbox class="header-label">Accounts</hbox>
        <hbox flex />
        <slot name="top-right" />
      </hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={account}>
      <hbox class="account">
        <hbox class="icon"><Icon data={AccountIcon} size="16px" /></hbox>
        <hbox class="label">{account.name}</hbox>
      </hbox>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  import type { MailAccount } from "../../../logic/Mail/MailAccount";
  import FastList from "../../Shared/FastList.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import AccountIcon from '../../asset/icon/appBar/mail.svg?raw';
  import type { Collection } from 'svelte-collections';

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
    margin-bottom: 8px;
    margin-left: 4px;
  }
  .header-label {
    color: grey;
    font-size: 12px;
  }
  .header :global(button) {
    margin-left: 4px;
  }
  .account {
    align-items: center;
    padding-left: 12px;
    padding-top: 2px;
    padding-bottom: 2px;
  }
  .icon :global(path),
  .icon :global(.cls-2) {
    stroke: var(--leftpane-fg);
  }
  .label {
    margin-left: 8px;
  }
</style>
