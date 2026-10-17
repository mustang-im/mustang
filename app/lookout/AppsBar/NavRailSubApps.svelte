{#if $subApps.hasItems}
  <hbox class="sub-apps">
    {#each $subApps.each as app (app)}
      <NavRailButton {app} small selected={$selectedApp == app} />
    {/each}
  </hbox>
{/if}

<script lang="ts">
  import type { MustangApp } from "../../frontend/AppsBar/MustangApp";
  import { selectedApp } from "../../frontend/AppsBar/selectedApp";
  import NavRailButton from "./NavRailButton.svelte";

  export let mainApp: MustangApp;

  $: subApps = $mainApp.subApps;
</script>

<style>
  .sub-apps {
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px;
    width: calc(var(--lo-nav-rail-width) - 8px);
  }
</style>
