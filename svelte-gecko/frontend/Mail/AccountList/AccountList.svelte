<vbox class="account-list">
  <FastList items={accounts} selectedItem={selectedAccount} rowHeight={20}>
    <header slot="header">
      <th>Accounts</th>
    </header>
    <row slot="row" let:item>
      <hbox>{item.emailAddress}</hbox>
    </row>
  </FastList>
</vbox>

<script lang="ts">
  import type { Account } from "mustang-lib";
  import type { Collection } from 'jscollections';
  import FastList from "../../Shared/FastList.svelte";

  export let accounts: Collection<Account>;
  export let selectedAccount: Account; /* in/out */
</script>

<style>
  .account-list {
    border-bottom: 1px solid grey;
  }
</style>
