<hbox class="main-window">
  <AppBar bind:selectedApp />
  <vbox class="app-frame">
    {#if selectedApp == AppArea.Mail}
      <MailApp />
    {:else if selectedApp == AppArea.Chat}
      <ChatApp />
    {:else if selectedApp == AppArea.Meet}
      <MeetApp />
    {:else if selectedApp == AppArea.Contacts}
      <ContactsApp />
    {:else if selectedApp == AppArea.Calendar}
      <CalendarApp />
    {:else if selectedApp == AppArea.Apps}
      <AppsLauncher />
    {/if}
  </vbox>
</hbox>

<script lang="ts">
  import AppsLauncher from "../Apps/AppsLauncher.svelte";
  import CalendarApp from "../Calendar/CalendarApp.svelte";
  import ChatApp from "../Chat/ChatApp.svelte";
  import ContactsApp from "../Contacts/ContactsApp.svelte";
  import MailApp from "../Mail/MailApp.svelte";
  import MeetApp from "../Meet/MeetApp.svelte";
  import { AppArea } from "./app";
  import AppBar from "./AppBar.svelte";

  let selectedApp = AppArea.Mail;
</script>

<style>
  .main-window {
    flex: 1 0 0;
  }
  .app-frame {
    flex: 1 0 0;
  }
</style>
