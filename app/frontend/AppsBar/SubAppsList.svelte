{#if $subApps.hasItems}
  <!-- A list of parts of the app,
    shown in the AppBar underneath the app button -->
  <vbox class="sub-app-bar">
    {#each $subApps.each as app}
      <AppButton on:click={() => selectedApp = app} selected={selectedApp == app}>
        <AppIcon slot="icon" icon={app.icon} size="8px" />
        <hbox slot="label" class="label">
          {app.name}
        </hbox>
      </AppButton>
    {/each}
  </vbox>
{/if}

<script lang="ts">
  import type { MustangApp } from "./MustangApp";
  import AppButton from "./AppButton.svelte";
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
          selectedApp = mainApp;
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
  .sub-app-bar :global(.app-button) {
    flex-direction: row;
    padding: 0px;
    padding-left: 16px;
  }
</style>
