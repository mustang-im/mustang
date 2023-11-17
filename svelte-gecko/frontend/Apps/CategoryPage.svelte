<vbox flex class="category-page">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <hbox class="header">
    <h1 class="name">{category.nameTranslated}</h1>
  </hbox>
  <div class="apps">
    {#each $apps.each as app}
      <span class="app">
        <AppShopButton {app} bind:selectedApp />
      </span>
    {/each}
  </div>
</vbox>

<script lang="ts">
  import type AppCategory from "../../logic/Apps/AppCategory";
  import type AppListed from "../../logic/Apps/AppListed";
  import type { Collection } from "svelte-collections";
  import AppShopButton from "./AppShopButton.svelte";

  $: console.log("category page", category);
  export let category: AppCategory;
  export let allApps: Collection<AppListed>;
  export let selectedApp: AppListed; /* in/out */

  $: apps = allApps.filter(app => app.categoryFullID == category.fullID);
</script>

<style>
  .category-page {
    padding: 24px;
  }
  .header {
    margin-top: 12px;
  }
  h1.name {
    font-size: 24px;
  }
  div.apps {
    flex: 1 0 0;
  }
  span.app {
    display: inline-flex;
  }
</style>
