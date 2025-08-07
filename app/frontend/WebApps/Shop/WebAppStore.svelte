<hbox flex class="app-store">
  <vbox flex class="categories font-small">
    <Scroll>
      <Categories showCategories={topLevelCategories} allCategories={categories} bind:selected={selectedCategory} />
    </Scroll>
  </vbox>
  <vbox flex class="apps">
    <Scroll>
      <hbox class="toolbar">
        <hbox flex />
        <RoundButton on:click={closeStore} icon={XIcon} label={$t`Close`} />
      </hbox>
      {#if selectedCategory}
        <CategoryPage category={selectedCategory} bind:selectedApp />
      {/if}
    </Scroll>
  </vbox>
</hbox>

<script lang="ts">
  import type { WebAppCategory } from "../../../logic/WebApps/WebAppCategory";
  import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
  import { appGlobal } from "../../../logic/app";
  import RoundButton from "../../Shared/RoundButton.svelte";
  import Categories from "./Categories.svelte";
  import CategoryPage from "./CategoryPage.svelte";
  import Scroll from "../../Shared/Scroll.svelte";
  import XIcon from "lucide-svelte/icons/x";
  import { onMount } from "svelte";
  import { t } from "../../../l10n/l10n";

  export let showStore = true; /* in/out */

  let appStore = appGlobal.webApps;
  let categories = appStore.categories;
  let selectedCategory: WebAppCategory;
  let selectedApp: WebAppListed;

  let topLevelCategories = $categories.filter(cat => !cat.parentID);

  onMount(async () => {
    await appStore.load();
    let catID = appStore.myApps.hasItems ? "selectedApps" : "recommended";
    selectedCategory = categories.find(cat => cat.fullID == catID);
  });

  function closeStore() {
    showStore = false;
  }
</script>

<style>
  .app-store {
    position: relative;
  }
  .categories {
    background-color: var(--leftbar-bg);
    color: var(--leftbar-fg);
    padding: 24px;
    padding-block-start: 64px;
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
