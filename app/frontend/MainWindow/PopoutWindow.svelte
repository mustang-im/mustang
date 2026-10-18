<vbox flex class="popout-window" dir={rtl}>
  <WindowHeader {title} />
  <NotificationBar notifications={$notifications} />
  <slot />
</vbox>

<script lang="ts">
  import { AppWindow } from "./AppWindow";
  import { notifications } from "../../logic/util/Notification";
  import WindowHeader from "./WindowHeader.svelte";
  import NotificationBar from "./NotificationBar.svelte";
  import { applyColors } from "../Settings/Global/AppThemeColors";
  import { getLocalStorage } from "../Util/LocalStorage";
  import { getUILocale } from "../../l10n/l10n";
  import { rtlLocales } from "../../l10n/list";

  export let title: string;

  const appWindow = AppWindow.current();
  $: appWindow.title = title;

  // <copied from="MainWindow.svelte">
  $: rtl = rtlLocales.includes(getUILocale()) ? 'rtl' : null;
  let colorsSetting = getLocalStorage("appearance.colors", {});
  $: applyColors($colorsSetting.value, appWindow.window.document);
  // </copied>
</script>

<style>
  .popout-window {
    border: 1px solid gray;
    min-width: 0;
  }
</style>
