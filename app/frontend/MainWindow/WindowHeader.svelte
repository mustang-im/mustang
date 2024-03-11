<hbox class="window-header">
  <vbox class="app-logo">
    <Icon data={logo} size="20px" />
  </vbox>
  <hbox class="app-title">
    {selectedApp?.name ?? "Mustang"}
  </hbox>
  <vbox flex class="free" />
  <SearchField bind:searchTerm={$globalSearchTerm} />
  <hbox class="right">
    <Button label="Settings" icon={SettingsIcon} iconSize="24px" plain iconOnly classes="settings"/>
  </hbox>
</hbox>

<script lang="ts">
  import type { MustangApp } from "../AppsBar/MustangApp";
  import SearchField from "../Shared/SearchField.svelte";
  import Button from "../Shared/Button.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import logo from '../asset/icon/general/logo.svg?raw';
  import SettingsIcon from 'lucide-svelte/icons/settings-2';
  import { globalSearchTerm } from "../AppsBar/selectedApp";

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

  .window-header :global(.search) {
    margin: 6px 12px;
    background-color: rgb(255, 255, 255, 10%);
    border: none;
  }
  .window-header :global(.search input) {
    background-color: transparent;
    color: white;
  }
  .window-header :global(.search input::placeholder) {
    color: white;
  }
</style>
