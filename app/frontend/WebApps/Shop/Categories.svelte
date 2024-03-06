<vbox class="categories">
  {#each $showCategories.each as category}
    <CategoryEntry {category} {allCategories} bind:selected />
  {/each}
</vbox>

<script lang="ts">
  import type AppCategory from "../../../logic/Apps/AppCategory";
  import CategoryEntry from "./CategoryEntry.svelte";
  import type { MapColl, Collection } from "svelte-collections";

  export let allCategories: MapColl<string, AppCategory>;
  export let showCategories: Collection<AppCategory>;
  export let selected: AppCategory; /* in/out */
</script>

<style>
</style>
