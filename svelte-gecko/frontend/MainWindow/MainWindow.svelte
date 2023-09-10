<hbox flex class="main-window">
  <AppBar bind:selectedApp />
  <vbox flex class="app-frame">
    {#if selectedApp == AppArea.Mail}
      <MailApp />
    {:else if selectedApp == AppArea.Chat}
      <ChatApp account={appGlobal.chatAccounts.first} />
    {:else if selectedApp == AppArea.Meet}
      <MeetApp />
    {:else if selectedApp == AppArea.Contacts}
      <ContactsApp persons={appGlobal.persons} />
    {:else if selectedApp == AppArea.Calendar}
      <CalendarApp />
    {:else if selectedApp == AppArea.Files}
      <FilesApp persons={appGlobal.persons} />
    {:else if selectedApp == AppArea.Apps}
      <AppsLauncher />
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import AppsLauncher from "../Apps/AppsLauncher.svelte";
  import ContactsApp from "../Contacts/ContactsApp.svelte";
  import MailApp from "../Mail/MailApp.svelte";
  import ChatApp from "../Chat/ChatApp.svelte";
  import MeetApp from "../Meet/MeetApp.svelte";
  import CalendarApp from "../Calendar/CalendarApp.svelte";
  import FilesApp from "../Files/FilesApp.svelte";
  import AppBar from "./AppBar.svelte";
  import { AppArea } from "./app";
  import { getTestObjects } from "../../logic/testData";
  import { appGlobal } from "../../logic/app";
  import { onMount } from "svelte";

  let selectedApp = AppArea.Mail;

  onMount(async() => {
    let app = await getTestObjects();
    for (let prop in app) {
      appGlobal[prop] = app[prop];
    }
  })
</script>

<style>
</style>
