<hbox class="window-header {osRTL ? "os-rtl" : ""}" class:mac
  style="--workspace-color: {$selectedWorkspace?.color ?? "var(--windowheader-bg)"}">
  <vbox class="app-logo">
    {#if appName == "Mustang"}
      <Icon data={logo} size="20px" />
    {/if}
  </vbox>
  <hbox class="workspace">
    <WorkspaceHeader {selectedApp} />
  </hbox>
  <hbox class="app-title">
    {$titleStore ?? selectedApp?.name ?? appName}
  </hbox>
  <vbox flex class="free" />
  <hbox class="search-box">
    <SearchField bind:searchTerm={$globalSearchTerm} />
  </hbox>
  <hbox class="right">
    <Button label={$t`Minimize`}
      icon={MinimizeIcon} iconSize="24px" plain iconOnly classes="minimize"
      onClick={onMinimize}
      />
    <Button label={$t`Close entire app`}
      icon={XIcon} iconSize="24px" plain iconOnly classes="close"
      onClick={onCloseApp}
      />
  </hbox>
</hbox>

<script lang="ts">
  import type { MustangApp } from "../AppsBar/MustangApp";
  import { globalSearchTerm } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  import { appName } from "../../logic/build";
  import WorkspaceHeader from "./WorkspaceHeader.svelte";
  import SearchField from "../Shared/SearchField.svelte";
  import Button from "../Shared/Button.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import logo from '../asset/icon/general/logo.svg?raw';
  import MinimizeIcon from 'lucide-svelte/icons/minus';
  import XIcon from 'lucide-svelte/icons/x';
  import { getOSName } from "../Util/util";
  import { webMail } from "../../logic/build";
  import { t } from "../../l10n/l10n";
  import { rtlLocales } from "../../l10n/list";
  import { selectedWorkspace } from "./Selected";

  export let selectedApp: MustangApp;

  // Enable Mac Styles
  const mac = (!webMail && getOSName() == "macintosh") ? true : false;
  // Check mac system text direction
  const osRTL = (rtlLocales.includes(navigator.language) && mac) ? true : false;

  function onMinimize() {
    appGlobal.remoteApp.minimizeMainWindow();
  }

  function onCloseApp() {
    window.close();
  }

  $: titleStore = selectedApp?.title;
</script>

<style>
  .window-header {
    background-color: var(--windowheader-bg);
    color: var(--windowheader-fg);
  }
  .app-logo {
    padding: 8px;
    padding-inline-start: 12px;
    width: 60px;
    align-items: start;
    justify-content: center;
    app-region: drag;
  }
  .app-title {
    font-size: 18px;
    align-items: center;
    margin-inline-start: 4px;
    app-region: drag;
  }
  .right :global(.close),
  .right :global(.minimize),
  .right :global(.settings) {
    color: white;
  }
  .right :global(.minimize svg) {
    margin-block-start: 10px; /* Find better icon */
  }
  .free {
    app-region: drag;
  }

  .window-header :global(.search) {
    margin: 6px 12px;
    outline: 1px solid rgb(255, 255, 255, 7%);
    border: none;
  }
  .window-header :global(.search:not(.has-search)) {
    background-color: var(--windowheader-bg);
    /*background-color: rgb(255, 255, 255, 10%);
    background-blend-mode: multiply;*/
  }
  .window-header :global(.search :has(input:focus)) {
    background-color: var(--inverted-bg);
  }
  .window-header :global(.search:not(.has-search) input) {
    background-color: transparent;
    color: var(--inverted-fg);
  }

  .search-box {
    --gradient-direction: 135deg;
    background-image: linear-gradient(var(--gradient-direction), var(--windowheader-bg) 10%, var(--workspace-color) 85%);
  }
  :global([dir="rtl"]) .search-box {
    --gradient-direction: 225deg;
  }
  .right {
    background-color: var(--workspace-color);
  }

  /* Styles for Mac */
  .mac .app-logo,
  :global([dir="rtl"]) .mac.os-rtl .app-logo {
    margin-inline-start: 80px;
    width: 15px;
  }
  .mac .right {
    display: none;
  }
  :global([dir="rtl"]) .mac:not(.os-rtl) .app-logo,
  .mac.os-rtl .app-logo {
    margin-inline-start: 0px;
  }
  :global([dir="rtl"]) .mac:not(.os-rtl) .search-box,
  .mac.os-rtl .search-box {
    padding-inline-end: 80px;
  }
  :global([dir="rtl"]) .mac .search-box {
    padding-inline-end: 0px;
  }
</style>
