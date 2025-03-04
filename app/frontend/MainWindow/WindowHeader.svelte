<hbox class="window-header" class:mac={isMacOS}>
  <vbox class="app-logo">
    {#if appName == "Mustang"}
    <Icon data={logo} size="20px" />
    {/if}
  </vbox>
  <hbox class="app-title">
    {$titleStore ?? selectedApp?.name ?? appName}
  </hbox>
  <vbox flex class="free" />
  <SearchField bind:searchTerm={$globalSearchTerm} />
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
  import SearchField from "../Shared/SearchField.svelte";
  import Button from "../Shared/Button.svelte";
  import Icon from 'svelte-icon/Icon.svelte';
  import logo from '../asset/icon/general/logo.svg?raw';
  import MinimizeIcon from 'lucide-svelte/icons/minus';
  import XIcon from 'lucide-svelte/icons/x';
  import { getOSName } from "../Util/util";
  import { t } from "../../l10n/l10n";

  export let selectedApp: MustangApp;

  // #if [WEBMAIL]
  // @ts-ignore
  let isMacOS = false; // don't style for Web Mail
  // #else
  // @ts-ignore
  let isMacOS = getOSName() == "macintosh" ? true : false;
  // #endif

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
    margin: 8px;
    margin-inline-start: 12px;
    width: 60px;
    align-items: start;
    justify-content: center;
    app-region: drag;
  }
  .app-title {
    font-size: 18px;
    align-items: center;
    margin-inline-start: 12px;
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
    border: none;
  }
  .window-header :global(.search:not(.has-search)) {
    background-color: rgb(255, 255, 255, 10%);
  }
  .window-header :global(.search :has(input:focus)) {
    background-color: var(--inverted-bg);
  }
  .window-header :global(.search:not(.has-search) input) {
    background-color: transparent;
    color: var(--inverted-fg);
  }

  .mac .app-logo {
    margin-inline-start: 80px;
    width: 15px;
  }
  .mac .right {
    display: none;
  }
</style>
