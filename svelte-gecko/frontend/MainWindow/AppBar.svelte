<vbox class="app-bar">
  <vbox class="app-logo">
    <Icon data={logo} scale={2} />
  </vbox>
  <AppButton on:click={() => openApp(AppArea.Contacts)} selected={selectedApp == AppArea.Contacts}>
    <hbox slot="icon"><Icon data={contacts} scale={2} /></hbox>
    <hbox slot="label">Contacts</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Mail)} selected={selectedApp == AppArea.Mail}>
    <hbox slot="icon"><Icon data={mail} scale={2} /></hbox>
    <hbox slot="label">Mail</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Chat)} selected={selectedApp == AppArea.Chat}>
    <hbox slot="icon"><Icon data={chat} scale={2} /></hbox>
    <hbox slot="label">Chat</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Meet)} selected={selectedApp == AppArea.Meet}>
    <hbox slot="icon"><Icon data={meet} scale={2} /></hbox>
    <hbox slot="label">Meet</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Calendar)} selected={selectedApp == AppArea.Calendar}>
    <hbox slot="icon"><Icon data={calendar} scale={2} /></hbox>
    <hbox slot="label">Calendar</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Files)} selected={selectedApp == AppArea.Files}>
    <hbox slot="icon"><Icon data={files} scale={2} /></hbox>
    <hbox slot="label">Files</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Apps)} selected={selectedApp == AppArea.Apps}>
    <hbox slot="icon"><Icon data={apps} scale={2} /></hbox>
    <hbox slot="label">Apps</hbox>
  </AppButton>
  <vbox class="bottom">
  </vbox>
</vbox>

<script lang="ts">
  import { AppArea } from "./app";
  import AppButton from "./AppButton.svelte";
  import Icon from 'svelte-awesome';
  import mail from 'svelte-awesome/icons/envelopeO';
  import chat from 'svelte-awesome/icons/commentO';
  import contacts from 'svelte-awesome/icons/userO';
  import calendar from 'svelte-awesome/icons/calendarCheckO';
  import meet from 'svelte-awesome/icons/videoCamera';
  import files from 'svelte-awesome/icons/filesO';
  import apps from 'svelte-awesome/icons/cubes';
  import logo from 'svelte-awesome/icons/plane';

  export let selectedApp: AppArea;

  function openApp(app: AppArea) {
    selectedApp = app;
  }
</script>

<style>
  .app-bar {
    width: 80px;
    /*background-color: darkblue;
    color: white;*/
  }
  .app-logo {
    align-items: center;
    padding-top: 16px;
    padding-bottom: 32px;
  }
  .bottom {
    flex: 1 0 0;
  }
  .app-logo, .app-bar :global(.app-button), .bottom {
    border-right: 1px solid grey;
  }
  .app-bar :global(.app-button.selected) {
    border-right: none;
    border-top: 1px solid grey;
    border-bottom: 1px solid grey;
  }
</style>
