{#if $subCategories.hasItems}
  <vbox class="sub-categories" app={mainCategory.id}>
    {#each $subCategories.each as category}
      <CategoryItem {category} />
    {/each}
  </vbox>
{/if}

<script lang="ts">
  import type { SettingsCategory } from "./SettingsCategory";
  import CategoryItem from "./CategoryItem.svelte";
  import type { Collection } from "svelte-collections";

  export let subCategories: Collection<SettingsCategory>;
  export let mainCategory: SettingsCategory;
</script>

<style>
  .sub-categories {
    justify-content: start;
    flex-wrap: wrap;
    margin: 0px 0px 0px 12px;
  }
  .sub-categories[app="webapps"] {
    margin-top: 128px;
  }
</style>
