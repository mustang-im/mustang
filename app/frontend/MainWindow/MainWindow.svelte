<vbox flex class="main-window">
  <WindowHeader selectedApp={$selectedApp} />
  <hbox flex>
    <AppBar bind:selectedApp={$selectedApp} showApps={mustangApps} />
    {#if !$selectedApp}
      Loading apps...
    {:else if sidebar}
      <Splitter name="sidebar" initialRightRatio={0.25}>
        <AppContent app={$selectedApp} slot="left"/>
        <vbox flex class="sidebar" slot="right">
          <svelte:component this={sidebar} />
        </vbox>
      </Splitter>
    {:else}
      <AppContent app={$selectedApp} />
    {/if}
  </hbox>
</vbox>
<MeetBackground />

<script lang="ts">
  import { mustangApps, selectedApp, sidebarApp } from "../AppsBar/selectedApp";
  import { appGlobal, getStartObjects, login } from "../../logic/app";
  import { loadMustangApps } from "../AppsBar/loadMustangApps";
  import AppBar from "../AppsBar/AppBar.svelte";
  import AppContent from "../AppsBar/AppContent.svelte";
  import WindowHeader from "./WindowHeader.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import MeetBackground from "../Meet/MeetBackground.svelte";
  import { meetMustangApp } from "../Meet/MeetMustangApp";
  import { catchErrors, showError } from "../Util/error";
  import { onMount } from "svelte";

  // $: sidebarApp = $mustangApps.filter(app => app.showSidebar).first; // TODO watch `app` property changes
  $: $sidebarApp = $meetMustangApp.showSidebar ? meetMustangApp : null;
  $: sidebar = $sidebarApp?.sidebar;

  onMount(() => catchErrors(async () => {
    loadMustangApps();
    if (appGlobal.persons.hasItems) {
      return;
    }
    await getStartObjects();
    await login(showError); // TODO Show as background error
  }));
</script>

<style>
  .main-window {
    border: 1px solid gray;
  }
  .sidebar {
    box-shadow: inset 1px 0px 5px 0px rgba(0, 0, 0, 10%);
    z-index: 2;
  }
</style>
