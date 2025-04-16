<vbox class="settings-category" class:selected on:click={onSelect}>
  <hbox class="label font-small" class:main={category.isMain}>
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
  .settings-category:hover {
    background-color: var(--hover-bg);
    color: var(--hover-fg);
  }
  .selected {
    background-color: var(--selected-bg);
    color:  var(--selected-fg);
  }
  .label {
    white-space: nowrap;
    overflow: hidden;
    margin-block-start: 4px;
    margin-inline-start: 4px;
    margin-inline-end: 4px;
  }
</style>
