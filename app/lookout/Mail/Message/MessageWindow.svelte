<SecondaryWindow title={$message.subject ?? ""}>
  <vbox flex class="message-window" bind:this={pageEl}>
    <MessageDisplay {message} />
  </vbox>
  <MessageKeys messages={[message]} {pageEl} />
  <MessagePrint />
  <!-- <copied from="../MailApp.svelte"> -->
  {#if $openColorCategories}
    <ColorCategoriesDialog items={$openColorCategories} on:close={() => $openColorCategories = null} />
  {/if}
  <!-- </copied> -->
</SecondaryWindow>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { openColorCategories } from "../Selected";
  import SecondaryWindow from "../../MainWindow/SecondaryWindow.svelte";
  import MessageDisplay from "./MessageDisplay.svelte";
  import MessageKeys from "./MessageKeys.svelte";
  import MessagePrint from "./MessagePrint.svelte";
  import ColorCategoriesDialog from "../../Shared/Tag/ColorCategoriesDialog.svelte";

  export let message: EMail;

  let pageEl: HTMLElement;
</script>

<style>
  .message-window {
    min-height: 0;
    padding: 0 8px 8px 8px;
  }
</style>
