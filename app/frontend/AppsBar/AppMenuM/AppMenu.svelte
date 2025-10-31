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
    justify-items: center;
    margin-block-end: 12px;

    width: 100%;
    max-width: 500px;
  }
  grid :global(hbox),
  grid :global(> button) {
    align-items: center;
    justify-content: center;
  }
  grid :global(.button) {
    box-shadow: -1px 0px 1px 0px rgba(22, 12, 39, 15%); /* #160C27 */
  }
  grid :global(.center-bar) {
    padding-block: 18px;
    padding-inline: 16px;
  }
  .app-menu :global(.app-button.contacts) {
    padding-block-end: 0px;
  }
</style>
