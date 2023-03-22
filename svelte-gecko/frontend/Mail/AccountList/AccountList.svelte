<vbox class="account-list">
  <FastList list={accounts} selectedItem={selectedAccount}>
    <header slot="header">
      <hbox>Accounts</hbox>
    </header>
    <row rowheight="20" slot="row">
      <hbox field="emailAddress"></hbox>
    </row>
  </FastList>
</vbox>

<script lang="ts">
  import FastList from "../../Util/FastList.svelte";

  export let accounts: Collection<Account>;
  export let selectedAccount: Account; /* in/out */
</script>

<style>
  .account-list {
    border-bottom: 1px solid grey;
  }
</style>
