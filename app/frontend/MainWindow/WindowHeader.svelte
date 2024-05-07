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
    <Button label="Settings"
      icon={SettingsIcon} iconSize="24px" plain iconOnly classes="settings"
      onClick={onOpenSettings}
      />
    <Button label="Close entire app"
      icon={XIcon} iconSize="24px" plain iconOnly classes="close"
      onClick={onCloseApp}
      />
  </hbox>
</hbox>

<script lang="ts">
  import type { MustangApp } from "../AppsBar/MustangApp";
  import { globalSearchTerm, openApp } from "../AppsBar/selectedApp";
  import { settingsMustangApp } from "../Settings/Window/SettingsMustangApp";
  import { selectedCategory } from "../Settings/Window/selected";
  import { getSettingsCategoryForApp } from "../Settings/Window/CategoriesUtils";
  import SearchField from "../Shared/SearchField.svelte";
  import Button from "../Shared/Button.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import logo from '../asset/icon/general/logo.svg?raw';
  import SettingsIcon from 'lucide-svelte/icons/settings-2';
  import XIcon from 'lucide-svelte/icons/x';

  export let selectedApp: MustangApp;

  function onOpenSettings() {
    $selectedCategory = getSettingsCategoryForApp($selectedApp);
    openApp(settingsMustangApp);
  }

  function onCloseApp() {
    window.close();
  }
</script>

<style>
  .window-header {
    background-color: var(--inverted-bg);
    color: var(--inverted-fg);
  }
  .app-logo {
    margin: 8px;
    margin-left: 12px;
    width: 60px;
    align-items: start;
    justify-content: center;
    app-region: drag;
  }
  .app-title {
    font-size: 18px;
    align-items: center;
    margin-left: 12px;
    app-region: drag;
  }
  .right :global(.close),
  .right :global(.settings) {
    color: white;
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
    color: var(--inverted-fg);
  }
  .window-header :global(.search input::placeholder) {
    color: var(--inverted-fg);
  }
</style>
