<!-- svelte-ignore a11y-click-events-have-key-events -->
<vbox class="settings-category" class:selected on:click={onSelect}>
  <hbox class="label" class:main={category.isMain}>
    {category.name}
  </hbox>
</vbox>
{#if isSectionOpen}
  <SubCategoriesList subCategories={category.subCategories} mainCategory={category} />
  <AccountsList {category} />
{/if}

<script lang="ts">
  import type { SettingsCategory } from "./SettingsCategory";
  import { selectedCategory, selectedAccount } from "./selected";
  import SubCategoriesList from "./SubCategoriesList.svelte";
  import AccountsList from "./AccountsList.svelte";

  /** in */
  export let category: SettingsCategory;

  $: selected = category == $selectedCategory;
  $: isSectionOpen = selected || category.subCategories.contains($selectedCategory) || category.accounts.contains($selectedAccount);

  function onSelect() {
    $selectedCategory = category;
    /*if (!category.parent.accounts.contains($selectedAccount)) {
      $selectedAccount = null;
    }*/
  }
</script>

<style>
  .settings-category {
    align-items: start;
    padding: 0px 0px 2px 18px;
  }
  .label {
    color: #160C27;
  }
  .settings-category:hover {
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
