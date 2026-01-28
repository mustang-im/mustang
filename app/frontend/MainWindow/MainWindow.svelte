<svelte:head>
  <title>{ appName }</title>
</svelte:head>
<svelte:window
  bind:outerWidth={windowWidth}
  on:visibilitychange={() => catchErrors(saveWindowSettings)}
  on:click|capture={(event) => catchErrors(() => onClickTopLevel(event))} />

<vbox flex class="main-window"
  dir={rtl}
  class:mobile={$appGlobal.isMobile}
  class:desktop={!$appGlobal.isMobile}>
  {#if !appGlobal.isMobile}
    <WindowHeader selectedApp={$selectedApp} />
  {/if}
  <hbox flex>
    {#if !appGlobal.isMobile}
      <DemoBarLeft />
      <AppBar bind:selectedApp={$selectedApp} showApps={mustangApps} />
    {/if}
    <vbox flex>
      <DemoBarTop />
      <NotificationBar notifications={$notifications} />
      // #if [MOBILE]
      <Router primary={false}>
        <SplitterHorizontal name="sidebar" initialBottomRatio={0.7} hasTop={!!sidebar}>
          <vbox flex class="sidebar" slot="top">
            <svelte:component this={sidebar} />
          </vbox>
          <AppContentRoutes slot="bottom" />
        </SplitterHorizontal>
        <NavigationM />
      </Router>
      // #else
      <Router {basepath} primary={false}>
        <Splitter name="sidebar" initialRightRatio={0.25} hasRight={!!sidebar}>
          <AppContentRoutes slot="left"/>
          <vbox flex class="sidebar" slot="right">
            <svelte:component this={sidebar} />
          </vbox>
        </Splitter>
      </Router>
      // #endif
    </vbox>
  </hbox>
</vbox>
<MeetBackground />
<MailInBackground />
<WebAppsInBackground />

<script lang="ts">
  import { selectedApp, sidebarApp, mustangApps, goTo, openApp } from "../AppsBar/selectedApp";
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
  import { categoriesLoaded } from "../Settings/SettingsCategories";
  import AppBar from "../AppsBar/AppBar.svelte";
  import AppContentRoutes from "../AppsBar/AppContentRoutes.svelte";
  import NotificationBar from "./NotificationBar.svelte";
  import WindowHeader from "./WindowHeader.svelte";
  import NavigationM from "./NavigationM.svelte";
  import Splitter from "../Shared/Splitter.svelte";
  import SplitterHorizontal from "../Shared/SplitterHorizontal.svelte";
  import MailInBackground from "../Mail/MailInBackground.svelte";
  import MeetBackground from "../Meet/MeetBackground.svelte";
  import WebAppsInBackground from "../WebApps/Runner/WebAppsInBackground.svelte";
  import DemoBarLeft from "./DemoBarLeft.svelte";
  import DemoBarTop from "./DemoBarTop.svelte";
  import { catchErrors, backgroundError } from "../Util/error";
  import { assert } from "../../logic/util/util";
  import { getUILocale, t } from "../../l10n/l10n";
  import { rtlLocales } from "../../l10n/list";
  import { appName } from "../../logic/build";
  import { onMount } from "svelte";
  import debounce from "lodash/debounce";
  import { Router } from "svelte-navigator";
  // #if [MOBILE]
  import { SplashScreen } from '@capacitor/splash-screen';
  // #endif

  // $: sidebarApp = $mustangApps.filter(app => app.showSidebar).first; // TODO watch `app` property changes
  $: $sidebarApp = $meetMustangApp.showSidebar ? meetMustangApp : null;
  let sidebar;
  const setSidebarDebounced = debounce(() => sidebar = $sidebarApp?.sidebar);
  $: $sidebarApp?.sidebar, setSidebarDebounced();
  $: rtl = rtlLocales.includes(getUILocale()) ? 'rtl' : null;
  categoriesLoaded; /* make sure to import the file, so that that categories load */

  let basepath: string; // default: no basepath
  if (window.location.pathname[2] == ":") { // #854 Windows in production mode has URL pathnames like `/D:/mail/`
    basepath = window.location.pathname.substring(0, 3);
  }

  onMount(() => catchErrors(onLoad));

  async function onLoad() {
    loadMustangApps();
    openApp(mailMustangApp, {});
    changeTheme($themeSetting.value);
    // #if [MOBILE]
    SplashScreen.hide();
    // #endif
    await startup();
  }

  async function startup() {
    await getStartObjects();
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
    goTo("/setup/initial", {});
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
  $: windowWidth, setSmall()
  function setSmall() {
    appGlobal.isSmall = windowWidth < 600;
  }

  function saveWindowSettings() {
    if (appGlobal.isMobile) {
      return;
    }
    let windowSize = getLocalStorage("window.size", [ window.outerWidth, window.outerHeight ]);
    let windowPosition = getLocalStorage("window.position", [ window.screenX, window.screenY ]);
    windowSize.value = [ window.outerWidth, window.outerHeight ];
    windowPosition.value = [ window.screenX, window.screenY ];
  }

  async function onClickTopLevel(event: MouseEvent) {
    let targetE = event.target as HTMLElement;
    let linkE = targetE.closest && targetE.closest("a[href]");
    let url = linkE?.getAttribute("href");
    if (!url) {
      return;
    }
    // _blank should open in external browser
    if (linkE.getAttribute("target") == "_blank") {
      // Let default handler open in external browser
      return;
      /* // ... unless it's a link in an email that we can handle internally
      if (linkE.getAttribute("source") == "convert-html" &&
          appGlobal.meetAccounts.some(acc => acc.isMeetingURL(new URL(url)))) {
        // open internally, continue below
      } else {
        // Let default handler open in external browser
        return;
      }*/
    }
    // open internally
    let urlObj = new URL(url); // throws, if invalid
    let protocol = urlObj.protocol.replace(":", "");
    let urlEvent = new Event("url-" + protocol); // e.g. "url-mailto"
    (urlEvent as any).url = url;
    targetE.dispatchEvent(urlEvent);
    event.stopPropagation();
    event.preventDefault();
  }
</script>

<style>
  .main-window:not(.mobile) {
    border: 1px solid gray;
    min-width: 640px;
  }
  .sidebar {
    box-shadow: inset 1px 0px 5px 0px rgba(0, 0, 0, 10%);
    z-index: 2;
  }
</style>
