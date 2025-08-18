<hbox class="category">
  <hbox flex class="name" on:click={onSelect}>{category.nameTranslated}</hbox>
  {#if hasChildCategories}
    <Button plain classes="openClose" on:click={toggleOpenClose} icon={isOpen ? ChevronUpIcon : ChevronDownIcon} />
  {/if}
</hbox>
{#if isOpen}
<vbox class="sub-categories">
  <Categories showCategories={childCategories} {allCategories} bind:selected />
</vbox>
{/if}

<script lang="ts">
  import type { WebAppCategory } from "../../../logic/WebApps/WebAppCategory";
  import Categories from "./Categories.svelte";
  import Button from "../../Shared/Button.svelte";
  import ChevronUpIcon from "lucide-svelte/icons/chevron-up";
  import ChevronDownIcon from "lucide-svelte/icons/chevron-down";
  import type { MapColl } from "svelte-collections";

  export let allCategories: MapColl<string, WebAppCategory>;
  export let category: WebAppCategory;
  export let selected: WebAppCategory; /* in/out */

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
    margin-block-end: 12px;
  }
  .sub-categories {
    margin-inline-start: 24px;
  }
</style>
