<vbox flex class="main-window">
  <WindowHeader selectedApp={$selectedApp} />
  <hbox flex>
    <AppBar bind:selectedApp={$selectedApp} />
    {#if $sidebarApp}
      <Splitter name="sidebar" initialRightRatio={0.25}>
        <AppContent app={$selectedApp} slot="left"/>
        <vbox flex class="sidebar" slot="right">
          {#if $sidebarApp == AppArea.Meet}
            <MeetSidebar />
          {/if}
        </vbox>
      </Splitter>
    {:else}
      <AppContent app={$selectedApp} />
    {/if}
  </hbox>
</vbox>
<OpenMeet />

<script lang="ts">
  import { AppArea, selectedApp, sidebarApp } from "./app";
  import { appGlobal, getStartObjects, login } from "../../logic/app";
  import AppBar from "./AppBar.svelte";
  import AppContent from "./AppContent.svelte";
  import WindowHeader from "./WindowHeader.svelte";
  import MeetSidebar from "../Meet/MeetSidebar.svelte";
  import OpenMeet from "../Meet/Start/OpenMeet.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import { showError } from "../Util/error";
  import { onMount } from "svelte";

  $: meetings = appGlobal.meetings;
  $: $sidebarApp = $meetings.hasItems && $selectedApp != AppArea.Meet ? AppArea.Meet : null; // TODO move into app, see MeetApp.svelte

  onMount(async () => {
    try {
      if (appGlobal.persons.hasItems) {
        return;
      }
      await getStartObjects();
      await login(showError); // TODO Show as background error
    } catch (ex) {
      showError(ex);
    }
  });
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
