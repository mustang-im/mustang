<svelte:window on:keydown|capture={onKeyDownCapture} />

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
  import lookoutCSS from "../app.css?inline";
  import { selectedApp, sidebarApp, history, openApp } from "../../frontend/AppsBar/selectedApp";
  import { notifications } from "../../frontend/MainWindow/Notification";
  import { meetMustangApp } from "../../frontend/Meet/MeetMustangApp";
  import { backstageState } from "../Settings/Backstage/BackstageState";
  import { GlobalKeyAction, GlobalKeys } from "./GlobalKeys";
  import { TitleBarSearch } from "./TitleBarSearch";
  import { RibbonModel } from "../Shared/Ribbon/Ribbon";
  import { Keyboard } from "../Shared/Keyboard";
  import { MessageActions } from "../Mail/MessageActions";
  import { ContactActions } from "../Contacts/ContactActions";
  import { selectedFolder } from "../../frontend/Mail/Selected";
  import { mailMustangApp } from "../../frontend/Mail/MailMustangApp";
  import { calendarMustangApp } from "../../frontend/Calendar/CalendarMustangApp";
  import { contactsMustangApp } from "../../frontend/Contacts/ContactsMustangApp";
  import { catchErrors } from "../../frontend/Util/error";
  import TitleBar from "./TitleBar.svelte";
  import StatusBar from "./StatusBar.svelte";
  import NavRail from "../AppsBar/NavRail.svelte";
  import AppContentRoutes from "../AppsBar/AppContentRoutes.svelte";
  import Backstage from "../Settings/Backstage/Backstage.svelte";
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

  // Not a plain CSS import: the global CSS must go away when the user switches to the classic frontend at runtime
  const globalStyle = document.createElement("style");
  globalStyle.textContent = lookoutCSS;
  document.head.append(globalStyle);
  onDestroy(() => globalStyle.remove());

  // svelte-navigator's types don't declare the default slot, so svelte-check rejects any content
  const RouterWithContent = Router as unknown as Component<RouterProps & { children: Snippet }>;

  const unlistenHistory = history.listen(onNavigate);
  onDestroy(unlistenHistory);
  function onNavigate() {
    backstageState.close();
  }

  function onKeyDownCapture() {
    // Appended anew for every key, so that it runs after the pages' own window listeners, which take precedence
    window.removeEventListener("keydown", onKeyDown);
    window.addEventListener("keydown", onKeyDown);
  }
  onDestroy(() => window.removeEventListener("keydown", onKeyDown));

  function onKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.cancelBubble || Keyboard.isEditor(event.target) ||
        document.querySelector("dialog:modal")) {
      return;
    }
    let action = GlobalKeys.actionFor(event);
    if (!action) {
      return;
    }
    event.preventDefault();
    catchErrors(() => runAction(action));
  }

  function runAction(action: GlobalKeyAction) {
    switch (action) {
      case GlobalKeyAction.Mail:
        return openApp(mailMustangApp, mailMustangApp.windowParams);
      case GlobalKeyAction.Calendar:
        return openApp(calendarMustangApp, calendarMustangApp.windowParams);
      case GlobalKeyAction.People:
        return openApp(contactsMustangApp, contactsMustangApp.windowParams);
      case GlobalKeyAction.NewMail:
        return MessageActions.newMail($selectedFolder);
      case GlobalKeyAction.NewAppointment:
        return MessageActions.newAppointment();
      case GlobalKeyAction.NewMeeting:
        return MessageActions.newMeeting();
      case GlobalKeyAction.NewContact:
        return MessageActions.newContact();
      case GlobalKeyAction.NewContactGroup:
        return ContactActions.newGroup(null);
      case GlobalKeyAction.AddressBook:
        return MessageActions.openAddressBook();
      case GlobalKeyAction.Search:
        return TitleBarSearch.input?.focus();
      case GlobalKeyAction.TellMe:
        return openTellMe();
      case GlobalKeyAction.CollapseRibbon:
        RibbonModel.collapsedSetting.value = !RibbonModel.collapsedSetting.value;
        return;
    }
  }

  function openTellMe() {
    let tellMe = Array.from(document.querySelectorAll<HTMLButtonElement>(".tell-me-button")).find(button => button.offsetParent);
    if (tellMe) {
      tellMe.click();
    } else {
      TitleBarSearch.input?.focus();
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
