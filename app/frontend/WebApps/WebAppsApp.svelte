{#if runningApp}
  <webview class="app-runner" src={runningApp.start} title={runningApp.nameTranslated} />
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
  import AppStore from "./Shop/AppStore.svelte";
  import AppsLauncher from "./Launcher/AppsLauncher.svelte";
  import { onMount } from "svelte";

  let showStore = false;
  let runningApp: AppListed;

  onMount(async () => {
    await appGlobal.apps.load();
  });

  $: console.log("running app", runningApp?.nameTranslated);
</script>

<style>
  .app-runner {
    flex: 1 0 0;
  }
</style>
