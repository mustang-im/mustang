<!-- svelte-ignore a11y-click-events-have-key-events -->
<hbox class="category">
  <hbox flex class="name" on:click={onSelect}>{category.nameTranslated}</hbox>
  {#if hasChildCategories}
    <Button plain classes="openClose" on:click={toggleOpenClose} icon={isOpen ? collapse : expand} />
  {/if}
</hbox>
{#if isOpen}
<vbox class="sub-categories">
  <Categories showCategories={childCategories} {allCategories} bind:selected />
</vbox>
{/if}

<script lang="ts">
  import type AppCategory from "../../logic/Apps/AppCategory";
  import type { MapColl } from "svelte-collections";
  import Categories from "./Categories.svelte";
  import Button from "../Shared/Button.svelte";
  import expand from '../asset/icon/general/expand.svg?raw';
  import collapse from '../asset/icon/general/collapse.svg?raw';

  export let allCategories: MapColl<string, AppCategory>;
  export let category: AppCategory;
  export let selected: AppCategory; /* in/out */

  let childCategories = allCategories.filter(cat => cat.parentID == category.id);
  $: hasChildCategories = !$childCategories.isEmpty;

  function onSelect() {
    selected = category;
    isOpen = !isOpen;
  }

  let isOpen = false;
  function toggleOpenClose(event: Event) {
    isOpen = !isOpen;
    event.stopPropagation();
  }
</script>

<style>
  .category {
    margin-bottom: 12px;
  }
  .sub-categories {
    margin-left: 24px;
  }
</style>
