<hbox flex class="web-apps">
  <LaunchBar {apps} bind:showStore />
  <Scroll>
    {#if showStore}
      <WebAppStore bind:showStore />
    {/if}
  </Scroll>
</hbox>

<script lang="ts">
  import { showingWebApp, selectedWebApp } from "./Runner/WebAppsRunning";
  import { appGlobal } from "../../logic/app";
  import LaunchBar from "./LauncherBar/LaunchBar.svelte";
  import WebAppStore from "./Shop/WebAppStore.svelte";
  import Scroll from "../Shared/Scroll.svelte";
  import { onDestroy, onMount } from "svelte";

  let showStore = false;

  $: apps = appGlobal.webApps.myApps;

  onMount(async () => {
    await appGlobal.webApps.load();
    if (appGlobal.webApps.myApps.isEmpty) {
      showStore = true;
    }
  });

  onDestroy(() => {
    $showingWebApp = null;
  });

  $: showApp(showStore)
  function showApp(showStore: boolean) {
    if (showStore) {
      $showingWebApp = null;
    } else if (!showStore) {
      $showingWebApp = $selectedWebApp;
    }
  }

  // $: console.log("showing app", $showingWebApp?.nameTranslated, "running", $webAppsRunning.contents.map(app => app.nameTranslated));
</script>
