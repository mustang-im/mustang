<hbox class="window-header">
  <vbox class="app-logo">
    <Icon data={logo} size="20px" />
  </vbox>
  <hbox class="app-title">
    {selectedApp?.name ?? "Mustang"}
  </hbox>
  <vbox flex class="free" />
  <hbox class="right">
    <Button label="Settings" icon={SettingsIcon} iconSize="24px" plain iconOnly classes="settings"/>
  </hbox>
</hbox>

<script lang="ts">
  import type { MustangApp } from "../AppsBar/MustangApp";
  import Button from "../Shared/Button.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import logo from '../asset/icon/general/logo.svg?raw';
  import SettingsIcon from 'lucide-svelte/icons/settings-2';

  export let selectedApp: MustangApp;
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
  .right :global(.settings) {
    color: white;
    margin-right: 8px;
  }
  .free {
    app-region: drag;
  }
</style>
