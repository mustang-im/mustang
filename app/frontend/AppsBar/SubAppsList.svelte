{#if shownSubApps.hasItems}
  <!-- A list of parts of the app,
    shown in the AppBar underneath the app button -->
  <hbox class="sub-app-bar" app={mainApp.id}>
    {#each shownSubApps.each as app}
      <SubAppButton selected={selectedApp == app} {app}
        on:click={() => catchErrors(() => onSelectApp(app))}>
        <AppIcon slot="icon" icon={app.icon} size="16px" />
      </SubAppButton>
    {/each}
  </hbox>
{/if}

<script lang="ts">
  import type { MustangApp } from "./MustangApp";
  import { getNavigation } from "./selectedApp";
  import { AppWindow } from "../MainWindow/AppWindow";
  import SubAppButton from "./SubAppButton.svelte";
  import AppIcon from "./AppIcon.svelte";
  import { catchErrors } from "../Util/error";
  import { CollectionObserver } from "svelte-collections";
  import { onDestroy, onMount } from "svelte";

  const { openApp } = getNavigation();
  const appWindow = AppWindow.current();

  export let mainApp: MustangApp;
  /* in/out */
  export let selectedApp: MustangApp | null;

  $: subApps = $mainApp.subApps;
  $: shownSubApps = $subApps.filterOnce(isInThisWindow);
  function isInThisWindow(app: MustangApp): boolean {
    return !app.appWindow || app.appWindow == appWindow;
  }

  function onSelectApp(app: MustangApp) {
    openApp(app, app.windowParams);
  }

  // Unselect sub-app that has been removed
  class RemovalObserver extends CollectionObserver<MustangApp> {
    added(apps: MustangApp[]) {}
    removed(apps: MustangApp[]) {
      for (let app of apps) {
        if (selectedApp == app) {
          selectedApp = mainApp.subApps.filterOnce(isInThisWindow).last ?? mainApp;
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
