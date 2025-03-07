<svelte:head>
  <title>{ appName }</title>
</svelte:head>
<svelte:window
  bind:outerWidth={windowWidth}
  bind:outerHeight={windowHeight}
  on:resize={saveWindowSize}
  on:load={loadWindowSize}
/>
<vbox flex class="main-window" dir={rtl}>
  <WindowHeader selectedApp={$selectedApp} />
  <hbox flex>
    <AppBar bind:selectedApp={$selectedApp} showApps={mustangApps} />
    <vbox flex>
      <NotificationBar />
      {#if !$selectedApp}
        {$t`Loading apps...`}
      {:else if sidebar}
        <Splitter name="sidebar" initialRightRatio={0.25}>
          <AppContent app={$selectedApp} slot="left"/>
          <vbox flex class="sidebar" slot="right">
            <svelte:component this={sidebar} />
          </vbox>
        </Splitter>
      {:else}
        <AppContent app={$selectedApp} />
      {/if}
    </vbox>
  </hbox>
</vbox>
<MeetBackground />
<MailInBackground />

<script lang="ts">
  import { selectedApp, sidebarApp, mustangApps, openApp } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  // #if [!WEBMAIL]
  // @ts-ignore ts2300
  import { getStartObjects, loginOnStartup } from "../../logic/startup";
  // #else
  // @ts-ignore ts2300
  import { getStartObjects, loginOnStartup } from "../../logic/WebMail/startup";
  // #endif
  import { selectedAccount } from "../Mail/Selected";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { loadMustangApps } from "../AppsBar/loadMustangApps";
  import { mailMustangApp } from "../Mail/MailMustangApp";
  import { meetMustangApp } from "../Meet/MeetMustangApp";
  import { SetupMustangApp } from "../Setup/SetupMustangApp";
  import AppBar from "../AppsBar/AppBar.svelte";
  import AppContent from "../AppsBar/AppContent.svelte";
  import NotificationBar from "./NotificationBar.svelte";
  import WindowHeader from "./WindowHeader.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import MailInBackground from "../Mail/MailInBackground.svelte";
  import MeetBackground from "../Meet/MeetBackground.svelte";
  // #if [!WEBMAIL]
  import InitialSetup from "../Setup/Import/InitialSetup.svelte";
  // #endif
  import { catchErrors, backgroundError } from "../Util/error";
  import { assert } from "../../logic/util/util";
  import { onMount } from "svelte";
  import { getUILocale, t } from "../../l10n/l10n";
  import { rtlLocales } from "../../l10n/list";
  import { appName } from "../../logic/build";

  // $: sidebarApp = $mustangApps.filter(app => app.showSidebar).first; // TODO watch `app` property changes
  $: $sidebarApp = $meetMustangApp.showSidebar ? meetMustangApp : null;
  $: sidebar = $sidebarApp?.sidebar;
  $: rtl = rtlLocales.includes(getUILocale()) ? 'rtl' : null;

  onMount(() => catchErrors(startup));

  async function startup() {
    loadMustangApps();
    await getStartObjects();
    changeTheme($themeSetting.value);
    if (appGlobal.emailAccounts.isEmpty && appGlobal.chatAccounts.isEmpty) {
      setup();
    } else {
      $selectedApp = mailMustangApp;
      $selectedAccount = appGlobal.emailAccounts.first;
      await loginOnStartup(console.error, backgroundError);
      // $selectedFolder = $selectedAccount.inbox;
    }
  }

  function setup() {
    // #if [!WEBMAIL]
    let setupApp = new SetupMustangApp();
    setupApp.mainWindow = InitialSetup;
    openApp(setupApp);
    // #endif
  }

  let themeSetting = getLocalStorage("appearance.theme", "system");
  $: changeTheme($themeSetting.value);
  function changeTheme(theme: string) {
    if (!appGlobal?.remoteApp) {
      return;
    }
    assert(["system", "light", "dark"].includes(theme), $t`Bad theme name ` + theme);
    appGlobal.remoteApp.setTheme(theme);
  }

  let windowWidth: number;
  let windowHeight: number;
  let windowSize = getLocalStorage("window.size", [ windowWidth, windowHeight ]);
  function saveWindowSize() {
    windowSize.value = [ window.outerWidth, window.outerHeight ];
  }
  function loadWindowSize() {
    assert($windowSize.value.length == 2 && $windowSize.value.every((e) => typeof(e) == "number"),
      $t`Bad window size` + $windowSize.value);
    window.resizeTo(windowSize.value[0], windowSize.value[1]);
  }
</script>

<style>
  .main-window {
    border: 1px solid gray;
  }
  .sidebar {
    box-shadow: inset 1px 0px 5px 0px rgba(0, 0, 0, 10%);
    z-index: 2;
  }
</style>
