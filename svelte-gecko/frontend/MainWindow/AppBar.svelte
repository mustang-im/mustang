<vbox class="app-bar">
  <AppButton on:click={() => openApp(AppArea.Contacts)} selected={selectedApp == AppArea.Contacts}>
    <hbox slot="icon" class="icon"><Icon data={contacts} size="24px" /></hbox>
    <hbox slot="label" class="label">Contacts</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Mail)} selected={selectedApp == AppArea.Mail}>
    <hbox slot="icon" class="icon"><Icon data={mail} size="24px" /></hbox>
    <hbox slot="label" class="label">Mail</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Chat)} selected={selectedApp == AppArea.Chat}>
    <hbox slot="icon" class="icon"><Icon data={chat} size="24px" /></hbox>
    <hbox slot="label" class="label">Chat</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Meet)} selected={selectedApp == AppArea.Meet}>
    <hbox slot="icon" class="icon"><Icon data={meet} size="24px" /></hbox>
    <hbox slot="label" class="label">Meet</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Calendar)} selected={selectedApp == AppArea.Calendar}>
    <hbox slot="icon" class="icon"><Icon data={calendar} size="24px" /></hbox>
    <hbox slot="label" class="label">Calendar</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Files)} selected={selectedApp == AppArea.Files}>
    <hbox slot="icon" class="icon"><Icon data={fileShare} size="24px" /></hbox>
    <hbox slot="label" class="label">Files</hbox>
  </AppButton>
  <AppButton on:click={() => openApp(AppArea.Apps)} selected={selectedApp == AppArea.Apps}>
    <hbox slot="icon" class="icon"><Icon data={appsLauncher} size="24px" /></hbox>
    <hbox slot="label" class="label">Apps</hbox>
  </AppButton>
  <vbox flex class="bottom">
  </vbox>
</vbox>

<script lang="ts">
  import { AppArea } from "./app";
  import AppButton from "./AppButton.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
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
    width: 64px;
    background-color: #5C5C71;
    box-shadow: 1px 0px 3px 0px rgba(22, 12, 39, 20%); /* #160C27 */
    padding-top: 8px;
  }
  .app-bar :global(.app-button),
  .bottom {
    border-right: 1px dotted grey;
  }
  .label {
    color: white;
  }
  .icon :global(.cls-1) {
    stroke: white;
  }
</style>
