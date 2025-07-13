{#if runningApp}
  <AppRunner {runningApp} />
{:else if showStore}
  <AppStore bind:showStore />
{:else if appGlobal.webApps.myApps}
  <AppsLauncher bind:showStore apps={appGlobal.webApps.myApps} bind:runningApp />
{:else}
  Loading...
{/if}

<script lang="ts">
  import type { WebAppListed } from "../../logic/WebApps/WebAppListed";
  import { appGlobal } from "../../logic/app";
  import AppRunner from "./Launcher/WebAppRunner.svelte";
  import AppStore from "./Shop/WebAppStore.svelte";
  import AppsLauncher from "./Launcher/WebAppsLauncher.svelte";
  import { onMount } from "svelte";

  let showStore = false;
  let runningApp: WebAppListed;

  onMount(async () => {
    await appGlobal.webApps.load();
  });
</script>
