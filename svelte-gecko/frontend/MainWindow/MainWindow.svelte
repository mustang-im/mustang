<hbox class="main-window">
  <AppBar bind:selectedApp />
  <vbox class="app-frame">
    {#if selectedApp == AppArea.Mail}
      <MailApp />
    {:else if selectedApp == AppArea.Chat}
      <ChatApp account={appGlobal.chatAccounts.first} />
    {:else if selectedApp == AppArea.Meet}
      <MeetApp />
    {:else if selectedApp == AppArea.Contacts}
      <ContactsApp persons={appGlobal.chatAccounts.first.persons} />
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
  import AppBar from "./AppBar.svelte";
  import { AppArea } from "./app";
  import { getTestObjects } from "../../logic/testData";
  import type { AppGlobal } from "../../logic/app";
  import { onMount } from "svelte";

  let selectedApp = AppArea.Mail;

  let appGlobal: AppGlobal;
  onMount(async () => {
    appGlobal = await getTestObjects();
  })
</script>

<style>
  .main-window {
    flex: 1 0 0;
  }
  .app-frame {
    flex: 1 0 0;
  }
</style>
