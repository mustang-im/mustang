<vbox flex class="settings-categories-pane">
  {#each $categories.each as category}
    <CategoryItem {category} />
  {/each}
  <vbox flex class="bottom">
  </vbox>
</vbox>

<script lang="ts">
  import type { SettingsCategory } from "./SettingsCategory";
  import CategoryItem from "./CategoryItem.svelte";
  import type { Collection } from "svelte-collections";

  /* Which apps to show on the app bar
   * in */
  export let categories: Collection<SettingsCategory>;
</script>

<style>
  .settings-categories-pane {
    background-color: #F9F9FD;
    box-shadow: 1px 0px 3px 0px rgba(22, 12, 39, 20%); /* #160C27 */
    padding-top: 24px;
    z-index: 4;
  }
</style>
