<vbox flex class="message-body">
  {#if mode == DisplayMode.HTML || mode == DisplayMode.HTMLWithExternal}
    <HTMLDisplay html={$message.html} allowExternalImages={mode == DisplayMode.HTMLWithExternal} />
  {:else if mode == DisplayMode.Plaintext}
    <PlaintextDisplay plaintext={$message.text} />
  {:else if mode == DisplayMode.Source}
    <PlaintextDisplay plaintext={getSource($message)} />
  {:else}
    Unknown mode
  {/if}
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import HTMLDisplay from "./HTMLDisplay.svelte";
  import PlaintextDisplay from "./PlaintextDisplay.svelte";
  import { catchErrors, showError } from "../../Util/error";

  export let message: EMail;

  let modeSetting = getLocalStorage("mail.contentRendering", "html");
  $: mode = $modeSetting.value as DisplayMode;

  function getSource(message): string {
    if (message.mime) {
      return new TextDecoder().decode($message.mime);
    }
    message.download().catch(showError);
    return "Loading email source...";
  }
</script>

<script lang="ts" context="module">
  export enum DisplayMode {
    HTML = "html",
    HTMLWithExternal = "with-external",
    Plaintext = "plaintext",
    Source = "source",
  }
</script>
