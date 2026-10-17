<vbox class="nav-rail" role="navigation" aria-label={$t`Apps`}>
  {#each railApps as app (app.id)}
    <AppButton {app} selected={isSelected(app, $selectedApp)} />
    <SubAppsList mainApp={app} />
  {/each}
  <vbox flex class="spacer" />
  <AppButton app={settingsMustangApp} selected={isSelected(settingsMustangApp, $selectedApp)}
    onClick={() => SettingsDialogs.openOptions()} />
</vbox>

<script lang="ts">
  import type { MustangApp } from "../../frontend/AppsBar/MustangApp";
  import { mustangApps, selectedApp } from "../../frontend/AppsBar/selectedApp";
  import { mailMustangApp } from "../../frontend/Mail/MailMustangApp";
  import { calendarMustangApp } from "../../frontend/Calendar/CalendarMustangApp";
  import { contactsMustangApp } from "../../frontend/Contacts/ContactsMustangApp";
  import { settingsMustangApp } from "../../frontend/Settings/Window/SettingsMustangApp";
  import { SettingsDialogs } from "../Settings/SettingsDialogs";
  import AppButton from "./AppButton.svelte";
  import SubAppsList from "./SubAppsList.svelte";
  import { t } from "../../l10n/l10n";

  $: railApps = sortRailApps($mustangApps.contents);

  function sortRailApps(apps: MustangApp[]): MustangApp[] {
    const firstApps: MustangApp[] = [ mailMustangApp, calendarMustangApp, contactsMustangApp ];
    return [
      ...firstApps.filter(app => apps.includes(app)),
      ...apps.filter(app => !firstApps.includes(app) && app != settingsMustangApp),
    ];
  }

  function isSelected(app: MustangApp, current: MustangApp): boolean {
    return !!current && (current == app || app.subApps.includes(current));
  }
</script>

<style>
  .nav-rail {
    flex: 0 0 auto;
    width: var(--lo-nav-rail-width);
    align-items: center;
    gap: 2px;
    padding: 4px 0 8px 0;
    background-color: var(--lo-window-bg);
  }
</style>
