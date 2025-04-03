{#if $subApps.hasItems}
  <!-- A list of parts of the app,
    shown in the AppBar underneath the app button -->
  <hbox class="sub-app-bar" app={mainApp.id}>
    {#each $subApps.each as app}
      <SubAppButton on:click={() => selectedApp = app} selected={selectedApp == app} {app}>
        <AppIcon slot="icon" icon={app.icon} size="16px" />
      </SubAppButton>
    {/each}
  </hbox>
{/if}

<script lang="ts">
  import type { MustangApp } from "./MustangApp";
  import SubAppButton from "./SubAppButton.svelte";
  import AppIcon from "./AppIcon.svelte";
  import { CollectionObserver } from "svelte-collections";
  import { catchErrors } from "../Util/error";
  import { onDestroy, onMount } from "svelte";

  export let mainApp: MustangApp;
  /* in/out */
  export let selectedApp: MustangApp | null;

  $: subApps = $mainApp.subApps;

  // Unselect sub-app that has been removed
  class RemovalObserver extends CollectionObserver<MustangApp> {
    added(apps: MustangApp[]) {}
    removed(apps: MustangApp[]) {
      for (let app of apps) {
        if (selectedApp == app) {
          selectedApp = mainApp.subApps.last ?? mainApp;
        }
      }
    }
  }
  let removalObserver = new RemovalObserver();
  onMount(() => catchErrors(() => {
    subApps.registerObserver(removalObserver);
  }));
  onDestroy(() => catchErrors(() => {
    subApps.unregisterObserver(removalObserver);
  }));
</script>

<style>
  .sub-app-bar {
    justify-content: end;
    flex-wrap: wrap;
    margin: 0px 12px 2px 6px;
  }
  .sub-app-bar[app="webapps"] {
    margin-block-start: 8px;
  }
</style>
