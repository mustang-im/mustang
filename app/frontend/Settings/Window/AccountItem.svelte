<vbox class="account" class:selected={itemSelected} on:click={onSelect}>
  <hbox class="label font-small">
    {$account.name}
  </hbox>
</vbox>
{#if accountSelected}
  <SubCategoriesList {subCategories} mainCategory={category} />
{/if}

<script lang="ts">
  import type { Account } from "../../../logic/Abstract/Account";
  import { MailAccount } from "../../../logic/Mail/MailAccount";
  import { accountSettings, type SettingsCategory } from "../SettingsCategory";
  import { selectedCategory, selectedAccount } from "./selected";
  import SubCategoriesList from "./SubCategoriesList.svelte";

  /** in */
  export let account: Account;
  export let category: SettingsCategory;

  $: accountSelected = account == $selectedAccount;
  $: itemSelected = account == $selectedAccount && $selectedCategory == mainAccountCategory;
  $: mainAccountCategory = accountSettings.find(cat => account instanceof cat.type && cat.isMain);
  $: subCategories = accountSettings.filterObservable(cat => account instanceof cat.type && !cat.isMain && showCat(cat, account));

  function showCat(category: SettingsCategory, account: Account): boolean {
    if (category.id == "mail-sharing" && account instanceof MailAccount) {
      return account.canShareWithPersons();
    }
    return true;
  }

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
    color: var(--fg);
    white-space: nowrap;
    overflow: hidden;
    margin-block-start: 4px;
    margin-inline-start: 4px;
    margin-inline-end: 4px;
  }
</style>
