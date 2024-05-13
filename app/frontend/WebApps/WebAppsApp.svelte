{#if runningApp}
  <AppRunner {runningApp} />
{:else if showStore}
  <AppStore bind:showStore />
{:else if appGlobal.apps.myApps}
  <AppsLauncher bind:showStore apps={appGlobal.apps.myApps} bind:runningApp />
{:else}
  Loading...
{/if}

<script lang="ts">
  import type AppListed from "../../logic/Apps/AppListed";
  import { appGlobal } from "../../logic/app";
  import AppRunner from "./Launcher/AppRunner.svelte";
  import AppStore from "./Shop/AppStore.svelte";
  import AppsLauncher from "./Launcher/AppsLauncher.svelte";
  import { onMount } from "svelte";

  let showStore = false;
  let runningApp: AppListed;

  onMount(async () => {
    await appGlobal.apps.load();
  });
</script>
