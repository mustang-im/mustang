<hbox class="window-header">
  <vbox class="app-logo">
    <Icon data={logo} size="20px" />
  </vbox>
  <hbox class="app-title">
    {#if selectedApp == AppArea.Mail}
      Mail
    {:else if selectedApp == AppArea.Chat}
      Chat
    {:else if selectedApp == AppArea.Meet}
      Meet
    {:else if selectedApp == AppArea.Contacts}
      Contacts
    {:else if selectedApp == AppArea.Calendar}
      Calendar
    {:else if selectedApp == AppArea.Files}
      Files
    {:else if selectedApp == AppArea.Apps}
      Apps
    {/if}
  </hbox>
</hbox>

<script lang="ts">
  import { AppArea } from "./app";
  import Icon from 'svelte-icon/Icon.svelte';
  import logo from '../asset/icon/general/logo.svg?raw';

  export let selectedApp: AppArea;
</script>

<style>
  .window-header {
    background-color: #160C27; /* 142862 */
    color: white;
  }
  .app-logo {
    margin: 8px;
    margin-left: 12px;
    width: 60px;
    align-items: start;
    justify-content: center;
  }
  .app-title {
    font-size: 18px;
    align-items: center;
    margin-left: 12px;
  }
</style>
