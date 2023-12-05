<vbox flex>
  <WindowHeader {selectedApp} />
  <hbox flex class="main-window">
    <AppBar bind:selectedApp />
    <vbox flex class="app-frame">
      {#if selectedApp == AppArea.Mail}
        <MailApp />
      {:else if selectedApp == AppArea.Chat}
        <ChatApp />
      {:else if selectedApp == AppArea.Meet}
        <MeetApp />
      {:else if selectedApp == AppArea.Contacts}
        <ContactsApp persons={appGlobal.persons} />
      {:else if selectedApp == AppArea.Calendar}
        <CalendarApp />
      {:else if selectedApp == AppArea.Files}
        <FilesApp persons={appGlobal.persons} />
      {:else if selectedApp == AppArea.Apps}
        <AppsApp />
      {/if}
    </vbox>
  </hbox>
</vbox>

<script lang="ts">
  import ContactsApp from "../Contacts/ContactsApp.svelte";
  import MailApp from "../Mail/MailApp.svelte";
  import ChatApp from "../Chat/ChatApp.svelte";
  import MeetApp from "../Meet/MeetApp.svelte";
  import CalendarApp from "../Calendar/CalendarApp.svelte";
  import FilesApp from "../Files/FilesApp.svelte";
  import AppBar from "./AppBar.svelte";
  import AppsApp from "../Apps/AppsApp.svelte";
  import { AppArea } from "./app";
  import { getTestObjects } from "../../logic/testData";
  import { appGlobal } from "../../logic/app";
  import { onMount } from "svelte";
  import WindowHeader from "./WindowHeader.svelte";

  let selectedApp = AppArea.Mail;

  /*
  import { DebugObserver } from "../../logic/util/DebugObserver";
  import { Contact } from "../../logic/Abstract/Contact";
  import { ChatPerson } from "../../logic/Chat/Person";

  appGlobal.chatAccounts.first?.chats.registerObserver(new DebugObserver());
  $: chatRooms?.registerObserver(new DebugObserver());
  $: console.log("main window: chat room", $chatRooms?.contents);
  setTimeout(() => {
    let chatRoom = new Chat();
    chatRoom.contact = new Contact();
    chatRoom.contact.person = new ChatPerson();
    chatRoom.contact.person.name = "Dummy";
    //chatRooms.add(chatRoom);
    console.log("chat account after 3s", appGlobal.chatAccounts.first);
    appGlobal.chatAccounts.first?.chats.add(chatRoom);
  }, 3000);
  */

  onMount(async() => {
    let app = await getTestObjects();
    for (let prop in app) {
      appGlobal[prop] = app[prop];
    }
  })
</script>

<style>
</style>
