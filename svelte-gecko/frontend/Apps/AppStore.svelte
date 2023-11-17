<hbox flex class="app-store">
  <vbox flex class="categories">
    <Categories showCategories={topLevelCategories} allCategories={categories} bind:selected={selectedCategory} />
  </vbox>
  <vbox flex class="apps">
    <hbox class="toolbar">
      <hbox flex />
      <RoundButton on:click={closeStore} icon={close} iconOnly label="Close" />
    </hbox>
    {#if selectedCategory}
      <CategoryPage category={selectedCategory} bind:selectedApp allApps={apps} />
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import type AppCategory from "../../logic/Apps/AppCategory";
  import type AppListed from "../../logic/Apps/AppListed";
  import { appGlobal } from "../../logic/app";
  import RoundButton from "../Shared/RoundButton.svelte";
  import Categories from "./Categories.svelte";
  import CategoryPage from "./CategoryPage.svelte";
  import close from '../asset/icon/general/close.svg?raw';
  import { onMount } from "svelte";

  export let showStore = true; /* in/out */

  let appStore = appGlobal.appStore;
  let categories = appStore.categories;
  let apps = appStore.apps;
  let selectedCategory: AppCategory;
  let selectedApp: AppListed;

  let topLevelCategories = $categories.filter(cat => !cat.parentID);

  onMount(async () => {
    await appStore.load();
    selectedCategory = categories.find(cat => cat.fullID == "recommended");
  });

  function closeStore() {
    showStore = false;
  }
</script>

<style>
  .categories {
    background-color: #E7E2EB;
    padding: 24px;
    padding-top: 64px;
    font-size: 14px;
    box-shadow: 3px 1px 8px 0px rgba(22, 12, 39, 8%); /* #160C27 */
  }
  .apps {
    flex: 4 0 0;
  }
  .toolbar {
    margin: 16px 16px 0px 16px;
  }
  .categories > :global(.categories > .category > .name) {
    font-weight: bold;
  }
</style>
