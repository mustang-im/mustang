<vbox class="app-bar">
  <vbox class="app-logo">
    <Icon data={logo} size="48px" />
  </vbox>
  <AppButton on:click={() => openApp(AppArea.Contacts)} selected={selectedApp == AppArea.Contacts}>
    <hbox slot="icon" class="icon"><Icon data={contacts} size="32px" /></hbox>
    <hbox slot="label" class="label">Contacts</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Mail)} selected={selectedApp == AppArea.Mail}>
    <hbox slot="icon" class="icon"><Icon data={mail} size="32px" /></hbox>
    <hbox slot="label" class="label">Mail</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Chat)} selected={selectedApp == AppArea.Chat}>
    <hbox slot="icon" class="icon"><Icon data={chat} size="32px" /></hbox>
    <hbox slot="label" class="label">Chat</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Meet)} selected={selectedApp == AppArea.Meet}>
    <hbox slot="icon" class="icon"><Icon data={meet} size="32px" /></hbox>
    <hbox slot="label" class="label">Meet</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Calendar)} selected={selectedApp == AppArea.Calendar}>
    <hbox slot="icon" class="icon"><Icon data={calendar} size="32px" /></hbox>
    <hbox slot="label" class="label">Calendar</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Files)} selected={selectedApp == AppArea.Files}>
    <hbox slot="icon" class="icon"><Icon data={fileShare} size="32px" /></hbox>
    <hbox slot="label" class="label">Files</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Apps)} selected={selectedApp == AppArea.Apps}>
    <hbox slot="icon" class="icon"><Icon data={appsLauncher} size="32px" /></hbox>
    <hbox slot="label" class="label">Apps</hbox>
  </AppButton>
  <vbox flex class="bottom">
  </vbox>
</vbox>

<script lang="ts">
  import { AppArea } from "./app";
  import AppButton from "./AppButton.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import logo from '../asset/icon/general/logo.svg?raw';
  import mail from '../asset/icon/appBar/mail.svg?raw';
  import chat from '../asset/icon/appBar/chat.svg?raw';
  import contacts from '../asset/icon/appBar/contacts.svg?raw';
  import calendar from '../asset/icon/appBar/calendar.svg?raw';
  import meet from '../asset/icon/appBar/meet.svg?raw';
  import fileShare from '../asset/icon/appBar/fileShare.svg?raw';
  import appsLauncher from '../asset/icon/appBar/appsLauncher.svg?raw';

  export let selectedApp: AppArea;

  function openApp(app: AppArea) {
    selectedApp = app;
  }
</script>

<style>
  .app-bar {
    width: 80px;
    background-color: #ccc7d2;
  }
  .app-logo {
    align-items: center;
    padding-top: 16px;
    padding-bottom: 32px;
  }
  .app-logo,
  .app-bar :global(.app-button),
  .bottom {
    border-right: 1px solid grey;
  }
</style>
