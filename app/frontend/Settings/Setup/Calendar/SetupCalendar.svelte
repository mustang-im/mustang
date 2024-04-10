<vbox flex class="setup-mail-window">
  <hbox flex />
  <vbox class="page-box">
    <svelte:component this={showPage} bind:showPage bind:config />
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import type { Calendar } from "../../../../logic/Calendar/Calendar";
  import { openApp } from "../../../AppsBar/selectedApp";
  import { settingsMustangApp } from "../../Window/SettingsMustangApp";
  import { getSettingsCategoryByID } from "../../Window/CategoriesUtils";
  import { selectedCategory } from "../../Window/selected";
  import SelectProtocol from "./SelectProtocol.svelte";
  import BackgroundVideo from "../BackgroundVideo.svelte";

  let config: Calendar;
  let showPage: ConstructorOfATypedSvelteComponent | null = SelectProtocol;

  $: checkClose(showPage);
  function checkClose(_dummy: any) {
    if (showPage) {
      return;
    }
    onClose();
  }

  function onClose() {
    $selectedCategory = getSettingsCategoryByID("calendar");
    openApp(settingsMustangApp);
  }
</script>

<style>
  .setup-mail-window {
    justify-content: center;
    align-items: center;
  }
  .page-box {
    max-width: 32em;
    padding: 24px 48px 20px 48px;
    background-color: white;
  }
  .setup-mail-window :global(input) {
    font-size: 16px;
  }
  .setup-mail-window :global(input::placeholder) {
    font-weight: 300;
  }
</style>
