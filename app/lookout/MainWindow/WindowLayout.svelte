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
</vbox>

<script lang="ts">
  import { selectedApp, sidebarApp, history } from "../../frontend/AppsBar/selectedApp";
  import { notifications } from "../../frontend/MainWindow/Notification";
  import { meetMustangApp } from "../../frontend/Meet/MeetMustangApp";
  import { backstageState } from "../Settings/BackstageState";
  import { settingsMustangApp } from "../../frontend/Settings/Window/SettingsMustangApp";
  import TitleBar from "./TitleBar.svelte";
  import StatusBar from "./StatusBar.svelte";
  import NavRail from "../AppsBar/NavRail.svelte";
  import AppContentRoutes from "../AppsBar/AppContentRoutes.svelte";
  import Backstage from "../Settings/Backstage.svelte";
  import NotificationBar from "../../frontend/MainWindow/NotificationBar.svelte";
  import Splitter from "../../frontend/Shared/Splitter.svelte";
  import { getUILocale } from "../../l10n/l10n";
  import { rtlLocales } from "../../l10n/list";
  import { Router } from "svelte-navigator";
  import type { RouterProps } from "svelte-navigator/types/Router";
  import type NavigatorLocation from "svelte-navigator/types/NavigatorLocation";
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
  function onNavigate({ location }: { location: NavigatorLocation }) {
    // The settings shown in Backstage > Options navigate to /settings themselves
    if (!location.pathname.startsWith(settingsMustangApp.appURL)) {
      backstageState.close();
    }
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
  }
  .app-area {
    min-width: 0;
    min-height: 0;
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
