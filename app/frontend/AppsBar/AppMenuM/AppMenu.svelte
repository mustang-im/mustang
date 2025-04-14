<vbox class="app-menu" on:click={onClose} flex>
  <grid>
    <!-- each app must add exactly 5 elements -->
    <TopAppMenu />
    <!--<WebAppsAppMenu />-->
    <FilesAppMenu />
    <CalendarAppMenu />
    <MeetAppMenu />
    <ChatAppMenu />
    <MailAppMenu />
    <ContactsAppMenu />
    <BottomAppMenu />
  </grid>
</vbox>
<AppMenuBarM />

<script lang="ts">
  import TopAppMenu from "./TopAppMenu.svelte";
  import WebAppsAppMenu from "./Apps/WebAppsAppMenu.svelte";
  import FilesAppMenu from "./Apps/FilesAppMenu.svelte";
  import CalendarAppMenu from "./Apps/CalendarAppMenu.svelte";
  import MeetAppMenu from "./Apps/MeetAppMenu.svelte";
  import ChatAppMenu from "./Apps/ChatAppMenu.svelte";
  import MailAppMenu from "./Apps/MailAppMenu.svelte";
  import ContactsAppMenu from "./Apps/ContactsAppMenu.svelte";
  import BottomAppMenu from "./BottomAppMenu.svelte";
  import AppMenuBarM from "./AppMenuBarM.svelte";
  import { navigate } from "svelte-navigator";

  function onClose() {
    navigate(-1);
  }
</script>

<style>
  .app-menu {
    align-items: center;
    justify-content: end;
  }
  grid {
    grid-template-columns: auto auto auto auto auto;
    align-items: center;
    margin-block-end: 12px;
  }
  grid :global(hbox) {
    align-items: center;
    justify-content: center;
  }
  grid :global(.empty) {
    width: 32px;
    height: 32px;
  }
  grid :global(.button) {
    width: 32px;
    height: 32px;
  }
  grid :global(.app-column) {
    margin-inline: 12px;
  }
  /*grid :global(.app-column .contacts) {
    padding-block-end: 0px;
    height: 32px;
  }*/
</style>
