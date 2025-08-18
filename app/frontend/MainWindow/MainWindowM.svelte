<svelte:head>
  <title>{ appName }</title>
</svelte:head>

<vbox flex class="main-window" dir={rtl} class:mobile={$appGlobal.isMobile}>
  {#await startup()}
    <hbox />
  {:then}
    <Router primary={false}>
      <NotificationBar notifications={$notifications} />
      {#if sidebar}
        <SplitterHorizontal name="sidebar" initialBottomRatio={0.3}>
          <vbox flex class="sidebar" slot="top">
            <svelte:component this={sidebar} />
          </vbox>
          <AppContentM slot="bottom" />
        </SplitterHorizontal>
      {:else}
        <AppContentM />
      {/if}
    </Router>
  {:catch ex}
    {showError(ex)}
  {/await}
</vbox>
<MeetBackground />
<MailInBackground />

<script lang="ts">
  import { goTo, sidebarApp } from "../AppsBar/selectedApp";
  import { appGlobal } from "../../logic/app";
  // #if [!WEBMAIL]
  // @ts-ignore ts2300
  import { getStartObjects, loginOnStartup } from "../../logic/startup";
  // #else
  // @ts-ignore ts2300
  import { getStartObjects, loginOnStartup } from "../../logic/WebMail/startup";
  // #endif
  import { selectedAccount } from "../Mail/Selected";
  import { notifications } from "./Notification";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { loadMustangApps } from "../AppsBar/loadMustangApps";
  import { meetMustangApp } from "../Meet/MeetMustangApp";
  import AppContentM from "../AppsBar/AppContentM.svelte";
  import NotificationBar from "./NotificationBar.svelte";
  import SplitterHorizontal from "../Shared/SplitterHorizontal.svelte";
  import MailInBackground from "../Mail/MailInBackground.svelte";
  import MeetBackground from "../Meet/MeetBackground.svelte";
  import { backgroundError, showError } from "../Util/error";
  import { assert } from "../../logic/util/util";
  import { getUILocale, t } from "../../l10n/l10n";
  import { rtlLocales } from "../../l10n/list";
  import { appName } from "../../logic/build";
  import { Router } from "svelte-navigator";

  // $: sidebarApp = $mustangApps.filter(app => app.showSidebar).first; // TODO watch `app` property changes
  $: $sidebarApp = $meetMustangApp.showSidebar ? meetMustangApp : null;
  $: sidebar = $sidebarApp?.sidebar;
  $: rtl = rtlLocales.includes(getUILocale()) ? 'rtl' : null;

  async function startup() {
    loadMustangApps();
    await getStartObjects();
    appGlobal.isSmall = true;
    appGlobal.isMobile = true;
    changeTheme($themeSetting.value);
    if (appGlobal.emailAccounts.isEmpty && appGlobal.chatAccounts.isEmpty) {
      setup();
    } else {
      $selectedAccount = appGlobal.emailAccounts.first;
      await loginOnStartup(console.error, backgroundError);
      // $selectedFolder = $selectedAccount.inbox;
    }
  }

  function setup() {
    // #if [!WEBMAIL]
    goTo("/setup/initial");
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
</script>

<style>
  .sidebar {
    box-shadow: inset 1px 0px 5px 0px rgba(0, 0, 0, 10%);
    z-index: 2;
  }
</style>
