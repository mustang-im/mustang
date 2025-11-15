<SettingsCategoriesPane {categories} />

{#if $appGlobal.isMobile}
  <CategoriesBarM />
{/if}

<script lang="ts">
  import { settingsCategories } from "../SettingsCategory";
  import type { SettingsCategory } from "../SettingsCategory";
  import { selectedCategory } from "../Window/selected";
  import { appGlobal } from "../../../logic/app";
  import SettingsCategoriesPane from "../Window/CategoriesPane.svelte";
  import CategoriesBarM from "./CategoriesBarM.svelte";
  import { goTo } from "../../AppsBar/selectedApp";
  import { URLPart } from "../../Util/util";

  let categories = settingsCategories;

  $selectedCategory = null;
  $: $selectedCategory && goToCategory($selectedCategory);
  function goToCategory(category: SettingsCategory) {
    console.log("go to category", category.name);
    goTo(URLPart`/settings/panel/${category.id}`, { category });
  }
</script>
