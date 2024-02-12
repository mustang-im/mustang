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
  import { webAppsMustangApp } from "./WebAppsMustangApp";
  import { MustangApp } from "../AppsBar/MustangApp";

  let showStore = false;
  let runningApp: AppListed;
  let myApps: Collection<AppListed>;

  onMount(async () => {
    let appStore = appGlobal.apps;
    await appStore.load();
    myApps = appStore.myApps;
    webAppsMustangApp.subApps = myApps.map(app => new WebAppSubMustangApp(app));
  });

  $: console.log("running app", runningApp?.nameTranslated);

  class WebAppSubMustangApp extends MustangApp {
    constructor(webApp: AppListed) {
      super();
      this.id = webApp.id;
      this.name = webApp.nameTranslated;
      this.icon = webApp.icon;
    }
  }
</script>

<style>
  .app-runner {
    flex: 1 0 0;
  }
</style>
