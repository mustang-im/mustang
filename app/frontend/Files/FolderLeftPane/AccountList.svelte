<vbox class="account-list">
  <FastList items={accounts} bind:selectedItem={selectedAccount} columns="1fr">
    <svelte:fragment slot="header">
      <hbox class="header">
        <hbox class="header-label font-smallest">{$t`Accounts`}</hbox>
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
  import type { FileSharingAccount } from "../../../logic/Files/FileSharingAccount";
  import { Directory } from "../../../logic/Files/Directory";
  import { selectedFile } from "../selected";
  import AccountListItem from "./AccountListItem.svelte";
  import FastList from "../../Shared/FastList.svelte";
  import type { Collection } from 'svelte-collections';
  import { t } from "../../../l10n/l10n";

  export let accounts: Collection<FileSharingAccount>;
  export let selectedAccount: FileSharingAccount; /* in/out */

  $: selectedAccount && onAccountChanged(selectedAccount)
  function onAccountChanged(account: FileSharingAccount) {
    if ($selectedFile instanceof Directory
      ? $selectedFile?.account != account
      : $selectedFile?.parent?.account != account) {
      $selectedFile = account.rootDirs.first;
    }
  }
</script>

<style>
  .account-list :global(.fast-list) {
    overflow: inherit;
  }
  .header {
    align-items: end;
    margin-block-start: 8px;
    margin-inline-start: 4px;
  }
  .header-label {
    color: grey;
  }
  .header :global(button) {
    margin-inline-start: 4px;
  }
</style>
