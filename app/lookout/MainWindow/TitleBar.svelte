<grid class="title-bar" class:mac class:os-rtl={osRTL}>
  <hbox class="identity">
    <hbox class="app-logo">
      <AppIcon icon={logo} size="18px" />
    </hbox>
    <hbox class="app-name">{appName}</hbox>
    <QuickAccessToolbar placement="above" />
  </hbox>
  <hbox class="search-box">
    {#if isMail}
      <MailSearchBox />
    {:else}
      <SearchField bind:searchTerm={$globalSearchTerm} placeholder={$t`Search`} />
    {/if}
  </hbox>
  <hbox class="window-buttons">
    {#if !webMail}
      <button class="window-button minimize" title={$t`Minimize`} aria-label={$t`Minimize`}
        on:click={() => catchErrors(onMinimize)}>
        <MinimizeIcon size="16" />
      </button>
      <button class="window-button maximize"
        title={canMaximize ? $t`Maximize` : $t`Restore window`}
        aria-label={canMaximize ? $t`Maximize` : $t`Restore window`}
        on:click={() => catchErrors(onMaximizeOrRestore)}>
        <svelte:component this={canMaximize ? MaximizeIcon : UnmaximizeIcon} size="13" />
      </button>
      <button class="window-button close" title={$t`Close`} aria-label={$t`Close`}
        on:click={() => catchErrors(onCloseApp)}>
        <XIcon size="17" />
      </button>
    {/if}
  </hbox>
</grid>

<script lang="ts">
  import { globalSearchTerm, selectedApp } from "../../frontend/AppsBar/selectedApp";
  import { mailMustangApp } from "../../frontend/Mail/MailMustangApp";
  import { appGlobal } from "../../logic/app";
  import { appName, webMail } from "../../logic/build";
  import SearchField from "../../frontend/Shared/SearchField.svelte";
  import MailSearchBox from "../Mail/Search/MailSearchBox.svelte";
  import QuickAccessToolbar from "../Shared/QuickAccess/QuickAccessToolbar.svelte";
  import { QuickAccessToolbar as QuickAccess } from "../Shared/QuickAccess/QuickAccess";
  import { MailQuickAccess } from "../Mail/MailQuickAccess";
  import AppIcon from "../../frontend/AppsBar/AppIcon.svelte";
  import logo from "../../frontend/asset/icon/general/logo.svg?raw";
  import MinimizeIcon from "lucide-svelte/icons/minus";
  import MaximizeIcon from "lucide-svelte/icons/square";
  import UnmaximizeIcon from "lucide-svelte/icons/copy";
  import XIcon from "lucide-svelte/icons/x";
  import { getOSName } from "../../frontend/Util/util";
  import { catchErrors } from "../../frontend/Util/error";
  import { rtlLocales } from "../../l10n/list";
  import { t } from "../../l10n/l10n";

  $: isMail = !!$selectedApp && ($selectedApp == mailMustangApp || mailMustangApp.subApps.includes($selectedApp));
  $: QuickAccess.commands.set(isMail ? MailQuickAccess.commands() : [MailQuickAccess.sendReceiveAll]);

  /* <copied from="../../frontend/MainWindow/WindowHeader.svelte"> */
  const mac = (!webMail && getOSName() == "macintosh") ? true : false;
  const osRTL = (rtlLocales.includes(navigator.language) && mac) ? true : false;

  function onMinimize() {
    appGlobal.remoteApp.minimizeMainWindow();
  }

  let canMaximize = true;
  function onMaximizeOrRestore() {
    if (canMaximize) {
      appGlobal.remoteApp.maximizeMainWindow();
    } else {
      appGlobal.remoteApp.unminimizeMainWindow();
    }
    canMaximize = !canMaximize;
  }

  function onCloseApp() {
    window.close();
  }
  /* </copied> */
</script>

<style>
  .title-bar {
    grid-template-columns: minmax(min-content, 1fr) minmax(200px, 680px) minmax(min-content, 1fr);
    align-items: stretch;
    height: var(--lo-titlebar-height);
    background-color: var(--lo-titlebar-bg);
    color: var(--lo-fg);
    app-region: drag;
  }
  .identity {
    align-items: center;
    gap: 8px;
    padding-inline-start: 14px;
    min-width: 0;
  }
  .app-logo {
    align-items: center;
  }
  .app-logo :global(.horse),
  .app-logo :global(.circle-bars) {
    fill: var(--lo-accent);
    stroke: var(--lo-accent);
  }
  .app-name {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }
  .search-box {
    align-items: center;
    padding: 0 8px;
  }
  .search-box :global(.search) {
    flex: 1 1 0;
    height: 30px;
    box-sizing: border-box;
    padding: 0 10px;
    gap: 8px;
    align-items: center;
    background-color: var(--lo-input-bg);
    border: 1px solid var(--lo-border);
    border-radius: var(--lo-radius-small);
    color: var(--lo-fg-secondary);
    app-region: no-drag;
  }
  .search-box :global(.search:hover) {
    border-color: var(--lo-border-strong);
  }
  .search-box :global(.search:focus-within) {
    border-color: var(--lo-border-strong);
    border-bottom: 2px solid var(--lo-accent);
  }
  .search-box :global(.search input) {
    flex: 1 1 0;
    min-width: 0;
    border: none;
    background-color: transparent;
    color: var(--lo-fg);
    font-size: var(--lo-font-size);
    outline: none;
  }
  .search-box :global(.search input:focus) {
    border: none;
  }
  .window-buttons {
    justify-content: flex-end;
    align-items: stretch;
  }
  .window-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    padding: 0;
    border: none;
    background-color: transparent;
    color: var(--lo-fg);
    app-region: no-drag;
  }
  .window-button:hover {
    background-color: var(--lo-hover-bg);
  }
  .window-button.close:hover {
    background-color: var(--lo-danger);
    color: var(--lo-danger-fg);
  }

  .mac .window-buttons {
    display: none;
  }
  .mac .identity {
    padding-inline-start: 80px;
  }
  :global([dir="rtl"]) .mac:not(.os-rtl) .identity,
  .mac.os-rtl .identity {
    padding-inline-start: 14px;
  }
</style>
