<svelte:head>
  <title>{ appName }</title>
</svelte:head>
<svelte:window
  on:visibilitychange={() => catchErrors(saveWindowSettings)}
  on:click|capture={(event) => catchErrors(() => onClickTopLevel(event))} />

<vbox flex class="main-window" dir={rtl}>
  <WindowHeader selectedApp={$selectedApp} />
  <hbox flex>
    <DemoBarLeft />
    <AppBar bind:selectedApp={$selectedApp} showApps={mustangApps} />
    <vbox flex>
      <DemoBarTop />
      <NotificationBar notifications={$notifications} />
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
<WebAppsInBackground />

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
  import { notifications } from "./Notification";
  import { selectedAccount, selectedFolder } from "../Mail/Selected";
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
  import WebAppsInBackground from "../WebApps/Runner/WebAppsInBackground.svelte";
  // #if [!WEBMAIL]
  import InitialSetup from "../Setup/Import/InitialSetup.svelte";
  // #endif
  import DemoBarLeft from "./DemoBarLeft.svelte";
  import DemoBarTop from "./DemoBarTop.svelte";
  import { catchErrors, backgroundError } from "../Util/error";
  import { assert } from "../../logic/util/util";
  import { onMount } from "svelte";
  import { useDebounce } from "@svelteuidev/composables";
  import { getUILocale, t } from "../../l10n/l10n";
  import { rtlLocales } from "../../l10n/list";
  import { appName } from "../../logic/build";

  // $: sidebarApp = $mustangApps.filter(app => app.showSidebar).first; // TODO watch `app` property changes
  $: $sidebarApp = $meetMustangApp.showSidebar ? meetMustangApp : null;
  let sidebar;
  const setSidebarDebounced = useDebounce(() => sidebar = $sidebarApp?.sidebar);
  $: $sidebarApp?.sidebar, setSidebarDebounced();
  $: rtl = rtlLocales.includes(getUILocale()) ? 'rtl' : null;

  onMount(() => catchErrors(startup));

  async function startup() {
    loadMustangApps();
    $selectedApp = mailMustangApp;
    await getStartObjects();
    changeTheme($themeSetting.value);
    if (appGlobal.emailAccounts.isEmpty && appGlobal.chatAccounts.isEmpty) {
      setup();
    } else {
      await loginOnStartup(console.error, backgroundError);
      // Setting $selectedApp late would overwrite commandline/URL handlers
      $selectedAccount = appGlobal.emailAccounts.first;
      $selectedFolder = $selectedAccount.inbox;
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

  function saveWindowSettings() {
    let windowSize = getLocalStorage("window.size", [ window.outerWidth, window.outerHeight ]);
    let windowPosition = getLocalStorage("window.position", [ window.screenX, window.screenY ]);
    windowSize.value = [ window.outerWidth, window.outerHeight ];
    windowPosition.value = [ window.screenX, window.screenY ];
  }

  async function onClickTopLevel(event: MouseEvent) {
    let targetE = event.target as HTMLElement;
    let linkE = targetE.closest && targetE.closest("a[href]");
    let url = linkE?.getAttribute("href");
    if (!url ||
        // Let default handler open in external browser
        linkE.getAttribute("target") == "_blank") {
      return;
    }
    let urlObj = new URL(url); // throws
    let urlEvent = new Event("url-" + urlObj.protocol.replace(":", "")); // e.g. "url-mailto"
    (urlEvent as any).url = url;
    targetE.dispatchEvent(urlEvent);
    event.stopPropagation();
    event.preventDefault();
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
