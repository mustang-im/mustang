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
  .account:hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  .selected {
    background-color: var(--selected-bg);
    color:  var(--selected-fg);
  }
  .label {
    font-size: 13px;
    color: var(--fg);
    white-space: nowrap;
    overflow: hidden;
    margin-block-start: 4px;
    margin-inline-start: 4px;
    margin-inline-end: 4px;
  }
</style>
