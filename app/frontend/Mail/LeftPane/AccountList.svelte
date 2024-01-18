<vbox class="account-list">
  <FastList items={accounts} bind:selectedItem={selectedAccount} columns="1fr">
    <svelte:fragment slot="header">
      <hbox class="header">
        <hbox class="header-label">Accounts</hbox>
        <hbox flex />
        <hbox class="button">
          <RoundButton label="Write new email" icon={WriteIcon} iconSize="16px" filled />
        </hbox>
      </hbox>
    </svelte:fragment>
    <svelte:fragment slot="row" let:item={account}>
      <hbox class="account">
        <hbox class="icon"><Icon data={AccountIcon} size="16px" /></hbox>
        <hbox class="label">{account.emailAddress}</hbox>
      </hbox>
    </svelte:fragment>
  </FastList>
</vbox>

<script lang="ts">
  import type { Account } from "mustang-lib";
  import type { Collection } from 'svelte-collections';
  import FastList from "../../Shared/FastList.svelte";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import AccountIcon from '../../asset/icon/appBar/mail.svg?raw';
  import WriteIcon from "lucide-svelte/icons/pencil";

  export let accounts: Collection<Account>;
  export let selectedAccount: Account; /* in/out */
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
  .button {
    margin: 8px 8px 0 8px;
  }
  .button :global(svg) {
    margin: 4px;
  }
  .account {
    align-items: center;
    padding-left: 12px;
    padding-top: 2px;
    padding-bottom: 2px;
  }
  .icon :global(.cls-2) {
    stroke: black;
  }
  .label {
    margin-left: 8px;
  }
</style>
