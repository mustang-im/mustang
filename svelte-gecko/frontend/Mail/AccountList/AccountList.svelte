<vbox class="account-list">
  <FastList items={accounts} bind:selectedItem={selectedAccount}>
    <svelte:fragment slot="header">
      <hbox>Accounts</hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={account}>
      <td>
        <hbox class="account">
          <hbox class="icon"><Icon data={AccountIcon} size="16px" /></hbox>
          <hbox class="label">{account.emailAddress}</hbox>
        </hbox>
      </td>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  import type { Account } from "mustang-lib";
  import type { Collection } from 'svelte-collections';
  import FastList from "../../Shared/FastList.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import AccountIcon from '../../asset/icon/appBar/mail.svg?raw';

  export let accounts: Collection<Account>;
  export let selectedAccount: Account; /* in/out */
</script>

<style>
  .account-list :global(.fast-list thead tr hbox) {
    background-color: transparent;
  }
  .account-list :global(.fast-list tbody tr hbox) {
    font-size: 14px;
  }
  .account {
    align-items: baseline;
  }
  .icon :global(.cls-2) {
    stroke: black;
  }
  .label {
    margin-left: 8px;
  }
</style>
