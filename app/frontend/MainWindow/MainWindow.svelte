<vbox flex>
  <WindowHeader selectedApp={$selectedApp} />
  <hbox flex class="main-window">
    <AppBar bind:selectedApp={$selectedApp} />
    <vbox flex class="app-frame">
      {#if $selectedApp == AppArea.Mail}
        <MailApp />
      {:else if $selectedApp == AppArea.Chat}
        <ChatApp />
      {:else if $selectedApp == AppArea.Meet}
        <MeetApp />
      {:else if $selectedApp == AppArea.Contacts}
        <ContactsApp persons={appGlobal.persons} />
      {:else if $selectedApp == AppArea.Calendar}
        <CalendarApp />
      {:else if $selectedApp == AppArea.Files}
        <FilesApp persons={appGlobal.persons} />
      {:else if $selectedApp == AppArea.Apps}
        <AppsApp />
      {/if}
    </vbox>
    {#if $sidebarApp}
      <vbox flex class="sidebar">
        {#if $sidebarApp == AppArea.Meet}
          <MeetSidebar />
        {/if}
      </vbox>
    {/if}
  </hbox>
</vbox>

<script lang="ts">
  import ContactsApp from "../Contacts/ContactsApp.svelte";
  import MailApp from "../Mail/MailApp.svelte";
  import ChatApp from "../Chat/ChatApp.svelte";
  import MeetApp from "../Meet/MeetApp.svelte";
  import CalendarApp from "../Calendar/CalendarApp.svelte";
  import FilesApp from "../Files/FilesApp.svelte";
  import MeetSidebar from "../Meet/MeetSidebar.svelte";
  import AppBar from "./AppBar.svelte";
  import AppsApp from "../Apps/AppsApp.svelte";
  import { AppArea, selectedApp, sidebarApp } from "./app";
  import { appGlobal, getStartObjects } from "../../logic/app";
  import { onMount } from "svelte";
  import WindowHeader from "./WindowHeader.svelte";

  $: meetings = appGlobal.meetings;
  $: $sidebarApp = $meetings.hasItems && $selectedApp != AppArea.Meet ? AppArea.Meet : null; // TODO move into app, see MeetApp.svelte

  onMount(async() => {
    if (appGlobal.persons.hasItems) {
      return;
    }
    await getStartObjects();
  })
</script>

<style>
  .app-frame {
    flex: 4 0 0;
  }
  .sidebar {
    box-shadow: inset 1px 0px 5px 0px rgba(0, 0, 0, 10%);
    z-index: 2;
  }
</style>
