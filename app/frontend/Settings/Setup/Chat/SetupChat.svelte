<vbox flex class="setup-mail-window">
  <hbox flex />
  <vbox class="page-box">
    <svelte:component this={showPage} bind:showPage bind:config />
  </vbox>
  <hbox flex />
  <BackgroundVideo />
</vbox>

<script lang="ts">
  import type { ChatAccount } from "../../../../logic/Chat/ChatAccount";
  import { SQLChatAccount } from "../../../../logic/Chat/SQL/SQLChatAccount";
  import { openApp } from "../../../AppsBar/selectedApp";
  import { chatMustangApp } from "../../../Chat/ChatMustangApp";
  import SelectProtocol from "./SelectProtocol.svelte";
  import ErrorMessage, { ErrorGravity } from "../ErrorMessage.svelte";
  import Footer from "../Footer.svelte";
  import ButtonsBottom from "../ButtonsBottom.svelte";
  import Button from "../../../Shared/Button.svelte";
  import BackgroundVideo from "../BackgroundVideo.svelte";
  import { Cancelled } from "../../../../logic/util/Abortable";
  import { NotReached } from "../../../../logic/util/util";

  let config: ChatAccount;
  let showPage: ConstructorOfATypedSvelteComponent | null = SelectProtocol;
  let abort = new AbortController();

  function reset() {
    abort.abort();
    config = null;
    errorMessage = null;
  }

  $: checkClose(showPage);
  function checkClose(_dummy: any) {
    if (showPage) {
      return;
    }
    onClose();
  }

  // Error

  let errorMessage: string | null = null;
  let errorGravity: ErrorGravity = ErrorGravity.OK;

  function showError(ex: Error | string) {
    if (typeof (ex) == "string") {
      ex = new Error(ex);
    }
    if (ex instanceof Cancelled) {
      return;
    }
    console.error(ex);
    errorMessage = ex.message;
    errorGravity = ErrorGravity.Error;
  }

  function clearError() {
    errorMessage = null;
    errorGravity = ErrorGravity.OK;
  }

  function onSave() {
    console.log("save config", config);
    SQLChatAccount.save(config);
    onClose();
  }

  function onClose() {
    openApp(chatMustangApp);
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
