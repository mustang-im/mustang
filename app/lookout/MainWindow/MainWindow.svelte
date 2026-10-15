<svelte:head>
  <title>{ appName }</title>
</svelte:head>
<!-- <copied from="../../frontend/MainWindow/MainWindow.svelte"> -->
<svelte:window
  bind:outerWidth={windowWidth}
  on:resize={saveWindowSettingsDebounced}
  on:blur={() => catchErrors(saveWindowSettings)}
  on:visibilitychange={() => catchErrors(saveWindowSettings)}
  on:beforeunload={() => catchErrors(saveWindowSettings)}
  on:click|capture={(event) => catchErrors(() => onClickTopLevel(event))} />
<!-- </copied> -->

<WindowLayout />
<MeetBackground />
<MailInBackground />
<CalendarInBackground />
<WebAppsInBackground />

<script lang="ts">
  import { appGlobal } from "../../logic/app";
  import { getLocalStorage } from "../../frontend/Util/LocalStorage";
  import { disableAppsBasedOnFeaturesXML } from "../../frontend/AppsBar/loadMustangApps";
  import { categoriesLoaded } from "../../frontend/Settings/SettingsCategories";
  import { applyColors } from "../../frontend/Settings/Global/AppThemeColors";
  import { WindowSettings } from "./WindowSettings";
  import { Startup } from "./Startup";
  import WindowLayout from "./WindowLayout.svelte";
  import MailInBackground from "../../frontend/Mail/MailInBackground.svelte";
  import CalendarInBackground from "../../frontend/Calendar/CalendarInBackground.svelte";
  import MeetBackground from "../../frontend/Meet/MeetBackground.svelte";
  import WebAppsInBackground from "../../frontend/WebApps/Runner/WebAppsInBackground.svelte";
  import { catchErrors } from "../../frontend/Util/error";
  import { assert } from "../../logic/util/util";
  import { t } from "../../l10n/l10n";
  import { appName } from "../../logic/build";
  import { onMount } from "svelte";
  import debounce from "lodash/debounce";

  categoriesLoaded;

  onMount(() => catchErrors(onLoad));

  /* <copied from="../../frontend/MainWindow/MainWindow.svelte"> */
  async function onLoad() {
    await new Startup().start();
    changeTheme($themeSetting.value);
    await disableAppsBasedOnFeaturesXML();
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
  let colorsSetting = getLocalStorage("appearance.colors", {});
  $: applyColors($colorsSetting.value);

  let windowWidth: number;
  $: windowWidth, setSmall()
  function setSmall() {
    appGlobal.isSmall = windowWidth < 600;
  }
  /* </copied> */

  const windowSettings = new WindowSettings();
  function saveWindowSettings() {
    windowSettings.save();
  }
  const saveWindowSettingsDebounced = debounce(() => catchErrors(saveWindowSettings), 1000);

  /* <copied from="../../frontend/MainWindow/MainWindow.svelte"> */
  async function onClickTopLevel(event: MouseEvent) {
    let targetE = event.target as HTMLElement;
    let linkE = targetE.closest && targetE.closest("a[href]");
    let url = linkE?.getAttribute("href");
    if (!url) {
      return;
    }
    if (linkE.getAttribute("target") == "_blank") {
      return;
    }
    let urlObj = new URL(url);
    let protocol = urlObj.protocol.replace(":", "");
    let urlEvent = new Event("url-" + protocol);
    (urlEvent as any).url = url;
    targetE.dispatchEvent(urlEvent);
    event.stopPropagation();
    event.preventDefault();
  }
  /* </copied> */
</script>
