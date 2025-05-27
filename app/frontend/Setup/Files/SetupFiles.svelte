<vbox flex class="setup-filesharing-window">
  <hbox flex />
  <vbox class="page-box">
    <svelte:component this={showPage} bind:showPage bind:config
      onCancel={onClose}
      />
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import { FileSharingAccount } from "../../../logic/Files/FileSharingAccount";
  import { openApp, selectedApp } from "../../AppsBar/selectedApp";
  import { selectedCategory } from "../../Settings/Window/selected";
  import { getSettingsCategoryForApp } from "../../Settings/Window/CategoriesUtils";
  import { settingsMustangApp } from "../../Settings/Window/SettingsMustangApp";
  import { filesMustangApp } from "../../Files/FilesMustangApp";
  import { SetupMustangApp } from "../SetupMustangApp";
  import SelectProtocol from "./SelectProtocol.svelte";
  import BackgroundVideo from "../Shared/BackgroundVideo.svelte";

  let config: FileSharingAccount;
  let showPage: ConstructorOfATypedSvelteComponent | null = SelectProtocol;

  $: checkClose(showPage);
  function checkClose(_dummy: any) {
    if (showPage) {
      return;
    }
    onClose();
  }

  function onClose() {
    if ($selectedApp instanceof SetupMustangApp && typeof($selectedApp.onBack) == "function") {
      $selectedApp.onBack();
    } else {
      $selectedCategory = getSettingsCategoryForApp(filesMustangApp);
      openApp(settingsMustangApp);
    }
  }
</script>

<style>
  .setup-filesharing-window {
    justify-content: center;
    align-items: center;
  }
  .page-box {
    max-width: 32em;
    padding: 24px 48px 20px 48px;
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
  .setup-filesharing-window :global(input) {
    font-size: 16px;
  }
  .setup-filesharing-window :global(input::placeholder) {
    font-weight: 300;
  }
</style>
