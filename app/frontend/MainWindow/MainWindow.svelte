<vbox flex class="main-window">
  <WindowHeader selectedApp={$selectedApp} />
  <hbox flex>
    <AppBar bind:selectedApp={$selectedApp} showApps={mustangApps} />
    <vbox flex>
      <NotificationBar />
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
    </vbox>
  </hbox>
</vbox>
<MeetBackground />

<script lang="ts">
  import { mustangApps, selectedApp, sidebarApp } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import { getStartObjects, loginOnStartup } from "../../logic/startup";
  import { loadMustangApps } from "../AppsBar/loadMustangApps";
  import AppBar from "../AppsBar/AppBar.svelte";
  import AppContent from "../AppsBar/AppContent.svelte";
  import NotificationBar from "./NotificationBar.svelte";
  import WindowHeader from "./WindowHeader.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import MeetBackground from "../Meet/MeetBackground.svelte";
  import { meetMustangApp } from "../Meet/MeetMustangApp";
  import { catchErrors, backgroundError } from "../Util/error";
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
    await loginOnStartup(backgroundError);
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
