<vbox flex class="message-body">
  {#if mode == DisplayMode.HTML || mode == DisplayMode.HTMLWithExternal}
    <HTMLDisplay html={$message.html} allowExternalImages={mode == DisplayMode.HTMLWithExternal} />
  {:else if mode == DisplayMode.Plaintext}
    <PlaintextDisplay plaintext={$message.text} />
  {:else if mode == DisplayMode.Source}
    <PlaintextDisplay plaintext={new TextDecoder().decode($message.mime)} />
  {:else}
    Unknown mode
  {/if}
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import HTMLDisplay from "./HTMLDisplay.svelte";
  import PlaintextDisplay from "./PlaintextDisplay.svelte";
  import { catchErrors } from "../../Util/error";

  export let message: EMail;

  let modeSetting = getLocalStorage("mail.contentRendering", "html");
  $: mode = $modeSetting.value as DisplayMode;

  $: mode && message && catchErrors(onChanged);
  async function onChanged() {
    if (mode == DisplayMode.Source) {
      await message.download();
    }
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
