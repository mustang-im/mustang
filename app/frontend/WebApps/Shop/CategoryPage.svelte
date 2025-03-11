<vbox flex class="category-page">
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
  import type WebAppCategory from "../../../logic/WebApps/WebAppCategory";
  import type WebAppListed from "../../../logic/WebApps/WebAppListed";
  import AppShopButton from "./WebAppShopButton.svelte";

  export let category: WebAppCategory;
  export let selectedApp: WebAppListed; /* in/out */

  $: apps = category.apps;
</script>

<style>
  .category-page {
    padding: 24px;
  }
  .header {
    margin-block-start: -32px;
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
