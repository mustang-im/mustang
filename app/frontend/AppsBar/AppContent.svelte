<vbox flex class="app-frame">
  {#if app == AppArea.Mail}
    <MailApp />
  {:else if app == AppArea.Chat}
    <ChatApp />
  {:else if app == AppArea.Meet}
    <MeetApp />
  {:else if app == AppArea.Contacts}
    <ContactsApp persons={appGlobal.persons} />
  {:else if app == AppArea.Calendar}
    <CalendarApp />
  {:else if app == AppArea.Files}
    <FilesApp persons={appGlobal.persons} />
  {:else if app == AppArea.Apps}
    <AppsApp />
  {/if}
</vbox>


<script lang="ts">
  import { AppArea } from "./app";
  import { appGlobal } from "../../logic/app";
  import ContactsApp from "../Contacts/ContactsApp.svelte";
  import MailApp from "../Mail/MailApp.svelte";
  import ChatApp from "../Chat/ChatApp.svelte";
  import MeetApp from "../Meet/MeetApp.svelte";
  import CalendarApp from "../Calendar/CalendarApp.svelte";
  import FilesApp from "../Files/FilesApp.svelte";
  import AppsApp from "../Apps/AppsApp.svelte";

  export let app: AppArea;
</script>

<style>
</style>
