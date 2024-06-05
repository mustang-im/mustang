<vbox flex class="setup-meet-window">
  <hbox flex />
  <vbox class="page-box">
    <svelte:component this={showPage} bind:showPage bind:config
      on:cancel={() => catchErrors(onClose)}
      />
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import type { MeetAccount } from "../../../../logic/Meet/MeetAccount";
  import { openApp } from "../../../AppsBar/selectedApp";
  import { selectedCategory } from "../../Window/selected";
  import { getSettingsCategoryForApp } from "../../Window/CategoriesUtils";
  import { settingsMustangApp } from "../../Window/SettingsMustangApp";
  import { meetMustangApp } from "../../../Meet/MeetMustangApp";
  import SelectProtocol from "./SelectProtocol.svelte";
  import BackgroundVideo from "../Shared/BackgroundVideo.svelte";
  import { catchErrors } from "../../../Util/error";

  let config: MeetAccount;
  let showPage: ConstructorOfATypedSvelteComponent | null = SelectProtocol;

  $: checkClose(showPage);
  function checkClose(_dummy: any) {
    if (showPage) {
      return;
    }
    onClose();
  }

  function onClose() {
    $selectedCategory = getSettingsCategoryForApp(meetMustangApp);
    openApp(settingsMustangApp);
  }
</script>

<style>
  .setup-meet-window {
    justify-content: center;
    align-items: center;
  }
  .page-box {
    max-width: 32em;
    padding: 24px 48px 20px 48px;
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
  .setup-meet-window :global(input) {
    font-size: 16px;
  }
  .setup-meet-window :global(input::placeholder) {
    font-weight: 300;
  }
</style>
