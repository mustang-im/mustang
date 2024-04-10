<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox class="account" class:selected={itemSelected} on:click={onSelect}>
  <hbox class="label">
    {$account.name}
  </hbox>
</vbox>
{#if accountSelected}
  <SubCategoriesList {subCategories} mainCategory={category} />
{/if}

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import type { SettingsCategory } from "./SettingsCategory";
  import { selectedCategory, selectedAccount } from "./selected";
  import SubCategoriesList from "./SubCategoriesList.svelte";
  import { accountSettings } from "../SettingsCategories";

  /** in */
  export let account: Account;
  export let category: SettingsCategory;

  $: accountSelected = account == $selectedAccount;
  $: itemSelected = account == $selectedAccount && $selectedCategory == mainAccountCategory;
  $: mainAccountCategory = accountSettings.find(ad => account instanceof ad.type && ad.isMain);
  $: subCategories = accountSettings.filter(ad => account instanceof ad.type && !ad.isMain);

  function onSelect() {
    $selectedAccount = account;
    $selectedCategory = mainAccountCategory;
  }
</script>

<style>
  .account {
    align-items: start;
    padding: 0px 0px 2px 18px;
  }
  .label {
    color: #160C27;
  }
  .account:hover {
    background-color: #A9DAD4;
  }
  .selected {
    background-color: #20AE9E;
    color: white;
  }
  .label {
    font-size: 13px;
    color: black;
    white-space: nowrap;
    overflow: hidden;
    margin-top: 4px;
    margin-left: 4px;
    margin-right: 4px;
  }
</style>
