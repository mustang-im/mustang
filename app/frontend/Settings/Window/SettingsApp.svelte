<Splitter name="settings-categories" initialRightRatio={4}>
  <Scroll slot="left">
    <SettingsCategoriesPane {categories} />
  </Scroll>
  <Scroll slot="right">
    <vbox flex class="right-page">
      <MainContent category={$selectedCategory} />
    </vbox>
  </Scroll>
</Splitter>

<script lang="ts">
  import { settingsCategories } from "./SettingsCategories";
  import { globalSearchTerm } from "../../AppsBar/selectedApp";
  import { selectedCategory } from "./selected";
  import SettingsCategoriesPane from "./CategoriesPane.svelte";
  import MainContent from "./MainContent.svelte";
  import Splitter from "../../Shared/Splitter.svelte";
  import Scroll from "../../Shared/Scroll.svelte";

  let categories = settingsCategories;

  $: onSearch($globalSearchTerm)
  function onSearch(searchTerm: string) {
    for (let cat of categories) {
      if (cat.searchMatchesDirect(searchTerm)) {
        $selectedCategory = cat;
        return;
      }
      for (let subCat of cat.subCategories) {
        if (subCat.searchMatchesDirect(searchTerm)) {
          $selectedCategory = subCat;
          return;
        }
      }
    }
  }
</script>

<style>
  .left-pane {
    border-right: 1px dotted lightgray;
    background-color: #F9F9FD;
    box-shadow: 2px 0px 6px 0px rgba(0, 0, 0, 10%); /* Also on PersonDetails */
  }
  .right-page {
    margin: 32px;
  }
  .right-page :global(input) {
    font-size: 16px;
  }
</style>
