<hbox flex class="app-store">
  <vbox flex class="categories">
    <Categories showCategories={topLevelCategories} allCategories={categories} bind:selected={selectedCategory} />
  </vbox>
  <vbox flex class="apps">
    {#if selectedCategory}
      <CategoryPage category={selectedCategory} bind:selectedApp allApps={apps} />
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type AppCategory from "../../logic/Apps/AppCategory";
  import type AppListed from "../../logic/Apps/AppListed";
  import { appGlobal } from "../../logic/app";
  import Categories from "./Categories.svelte";
  import CategoryPage from "./CategoryPage.svelte";
  import { onMount } from "svelte";

  let appStore = appGlobal.appStore;
  let categories = appStore.categories;
  let apps = appStore.apps;
  let selectedCategory: AppCategory;
  let selectedApp: AppListed;

  let topLevelCategories = $categories.filter(cat => !cat.parentID);

  onMount(async () => {
    await appStore.load();
    topLevelCategories = $categories.filter(cat => !cat.parentID); // TODO observers not firing
  });
</script>

<style>
  .categories {
    background-color: #E7E2EB;
    padding: 24px;
    padding-top: 64px;
    font-size: 14px;
  }
  .apps {
    flex: 3 0 0;
    box-shadow: inset 3px 1px 8px 0px rgba(22, 12, 39, 8%); /* #160C27 */
  }
  .categories > :global(.categories > .category > .name) {
    font-weight: bold;
  }
</style>
