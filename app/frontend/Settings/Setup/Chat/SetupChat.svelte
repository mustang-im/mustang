<vbox flex class="setup-chat-window">
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
  import type { ChatAccount } from "../../../../logic/Chat/ChatAccount";
  import { openApp } from "../../../AppsBar/selectedApp";
  import { selectedCategory } from "../../Window/selected";
  import { getSettingsCategoryForApp } from "../../Window/CategoriesUtils";
  import { settingsMustangApp } from "../../Window/SettingsMustangApp";
  import { chatMustangApp } from "../../../Chat/ChatMustangApp";
  import SelectProtocol from "./SelectProtocol.svelte";
  import BackgroundVideo from "../BackgroundVideo.svelte";
  import { catchErrors } from "../../../Util/error";

  let config: ChatAccount;
  let showPage: ConstructorOfATypedSvelteComponent | null = SelectProtocol;

  $: checkClose(showPage);
  function checkClose(_dummy: any) {
    if (showPage) {
      return;
    }
    onClose();
  }

  function onClose() {
    $selectedCategory = getSettingsCategoryForApp(chatMustangApp);
    openApp(settingsMustangApp);
  }
</script>

<style>
  .setup-chat-window {
    justify-content: center;
    align-items: center;
  }
  .page-box {
    max-width: 32em;
    padding: 24px 48px 20px 48px;
    background-color: var(--main-bg);
    color: var(--main-fg);
  }
  .setup-chat-window :global(input) {
    font-size: 16px;
  }
  .setup-chat-window :global(input::placeholder) {
    font-weight: 300;
  }
</style>
