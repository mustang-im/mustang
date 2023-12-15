{#if runningApp}
  <iframe class="app-runner" src={runningApp.start} title={runningApp.nameTranslated} />
{:else if showStore}
  <AppStore bind:showStore />
{:else if myApps}
  <AppsLauncher bind:showStore apps={myApps} bind:runningApp />
{:else}
  Loading...
{/if}

<script lang="ts">
  import type AppListed from "../../logic/Apps/AppListed";
  import { appGlobal } from "../../logic/app";
  import type { Collection } from "svelte-collections";
  import AppStore from "./AppStore.svelte";
  import AppsLauncher from "./AppsLauncher.svelte";
  import { onMount } from "svelte";

  let showStore = false;
  let runningApp: AppListed;
  let myApps: Collection<AppListed>;

  onMount(async () => {
    let appStore = appGlobal.apps;
    await appStore.load();
    myApps = appStore.myApps;
  });

  $: console.log("running app", runningApp?.nameTranslated);
</script>

<style>
  .app-runner {
    flex: 1 0 0;
  }
</style>
