<vbox flex class="main-window desktop lookout-window" dir={rtl}>
  <TitleBar />
  <vbox flex class="below-title">
    <hbox flex class="window-body">
      <NavRail />
      <vbox flex class="app-area">
        <NotificationBar notifications={$notifications} />
        {#if $selectedApp}
          <RouterWithContent primary={false} {history}>
            <Splitter name="sidebar" initialRightRatio={0.25} hasRight={!!sidebar}>
              <AppContentRoutes slot="left" />
              <vbox flex class="sidebar" slot="right">
                <svelte:component this={sidebar} />
              </vbox>
            </Splitter>
          </RouterWithContent>
        {/if}
      </vbox>
    </hbox>
    <StatusBar />
    {#if $backstageState.isOpen}
      <vbox class="backstage-overlay">
        <Backstage />
      </vbox>
    {/if}
  </vbox>
  <SettingsDialogHost />
  <MessageBoxHost />
</vbox>

<script lang="ts">
  import "../app.css";
  import { selectedApp, sidebarApp, history } from "../../frontend/AppsBar/selectedApp";
  import { notifications } from "../../frontend/MainWindow/Notification";
  import { meetMustangApp } from "../../frontend/Meet/MeetMustangApp";
  import { backstageState } from "../Settings/BackstageState";
  import TitleBar from "./TitleBar.svelte";
  import StatusBar from "./StatusBar.svelte";
  import NavRail from "../AppsBar/NavRail.svelte";
  import AppContentRoutes from "../AppsBar/AppContentRoutes.svelte";
  import Backstage from "../Settings/Backstage.svelte";
  import SettingsDialogHost from "../Settings/SettingsDialogHost.svelte";
  import MessageBoxHost from "../Shared/Dialog/MessageBoxHost.svelte";
  import NotificationBar from "../../frontend/MainWindow/NotificationBar.svelte";
  import Splitter from "../../frontend/Shared/Splitter.svelte";
  import { getUILocale } from "../../l10n/l10n";
  import { rtlLocales } from "../../l10n/list";
  import { Router } from "svelte-navigator";
  import type { RouterProps } from "svelte-navigator/types/Router";
  import { onDestroy, type Component, type Snippet } from "svelte";

  /* <copied from="../../frontend/MainWindow/MainWindow.svelte"> */
  $: $sidebarApp = $meetMustangApp.showSidebar ? meetMustangApp : null;
  $: sidebar = $sidebarApp?.sidebar;
  $: rtl = rtlLocales.includes(getUILocale()) ? 'rtl' : null;
  /* </copied> */

  // svelte-navigator's types don't declare the default slot, so svelte-check rejects any content
  const RouterWithContent = Router as unknown as Component<RouterProps & { children: Snippet }>;

  const unlistenHistory = history.listen(onNavigate);
  onDestroy(unlistenHistory);
  function onNavigate() {
    backstageState.close();
  }
</script>

<style>
  .lookout-window {
    min-width: 640px;
    min-height: 0;
    background-color: var(--lo-window-bg);
    color: var(--lo-fg);
    font-family: var(--lo-font);
    font-size: var(--lo-font-size);
    overflow: hidden;
  }
  .below-title {
    position: relative;
    min-height: 0;
  }
  .window-body {
    min-height: 0;
    isolation: isolate;
  }
  .app-area {
    min-width: 0;
    min-height: 0;
  }
  .app-area > :global(.notification-bar) {
    min-height: 34px;
    margin: 0 8px 6px 8px;
    padding-inline-start: 4px;
    border: 1px solid var(--lo-infobar-border);
    border-radius: var(--lo-radius);
    background-color: var(--lo-infobar-bg);
    color: var(--lo-fg);
    box-shadow: none;
  }
  .app-area > :global(.notification-bar[severity="error"]) {
    border-color: var(--lo-infobar-error-border);
    background-color: var(--lo-infobar-error-bg);
  }
  .app-area > :global(.notification-bar[severity="meltdown"]) {
    border-color: var(--lo-danger);
    background-color: var(--lo-danger);
    color: var(--lo-danger-fg);
  }
  .app-area > :global(.notification-bar[severity="info"]),
  .app-area > :global(.notification-bar[severity="logged-out"]) {
    border-color: var(--lo-selected-bg);
    background-color: var(--lo-accent-tint);
  }
  .app-area > :global(.notification-bar > hbox:first-child) {
    display: none;
  }
  .app-area > :global(.notification-bar button) {
    border-color: transparent;
    background-color: transparent;
    color: inherit;
  }
  .app-area > :global(.notification-bar button:hover) {
    background-color: var(--lo-hover-bg);
  }
  .app-area > :global(.notification-bar button.action) {
    border-color: var(--lo-input-border);
    background-color: var(--lo-pane-bg);
    color: var(--lo-fg);
  }
  .sidebar {
    box-shadow: var(--lo-shadow-card);
    z-index: 2;
  }
  .backstage-overlay {
    position: absolute;
    inset: 0;
    z-index: 50;
    display: flex;
  }
</style>
