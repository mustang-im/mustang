<hbox flex class="web-apps">
  <LaunchBar {apps} bind:showStore />
  <Scroll>
    {#if showStore}
      <WebAppStore bind:showStore />
    {:else}
      <WebAppsRunning />
    {/if}
  </Scroll>
</hbox>

<script lang="ts">
  import type { WebAppListed } from "../../logic/WebApps/WebAppListed";
  import { appGlobal } from "../../logic/app";
  import LaunchBar from "./LauncherBar/LaunchBar.svelte";
  import WebAppsRunning from "./Runner/WebAppsRunning.svelte";
  import WebAppStore from "./Shop/WebAppStore.svelte";
  import Scroll from "../Shared/Scroll.svelte";
  import { onMount } from "svelte";

  let showStore = false;
  let runningApp: WebAppListed;

  $: apps = appGlobal.webApps.myApps;

  onMount(async () => {
    await appGlobal.webApps.load();
    if (appGlobal.webApps.myApps.isEmpty) {
      showStore = true;
    }
  });
</script>
