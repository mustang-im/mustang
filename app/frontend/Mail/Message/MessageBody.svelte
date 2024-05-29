<vbox flex class="message-body">
  {#await message.loadBody()}
    Loading...
  {:then}
    {#if mode == DisplayMode.HTML || mode == DisplayMode.HTMLWithExternal}
      <HTMLDisplay html={$message.html} allowExternalImages={mode == DisplayMode.HTMLWithExternal} />
    {:else if mode == DisplayMode.Plaintext}
      <PlaintextDisplay plaintext={$message.text} />
      <!--<HTMLDisplay html={convertTextToHTML($message.text)} />-->
    {:else if mode == DisplayMode.Source}
      {#await message.loadMIME()}
        Loading...
      {:then}
        <PlaintextDisplay plaintext={getSource($message)} />
      {/await}
    {:else if mode == DisplayMode.Thread}
      <ThreadDisplay {message} />
    {:else}
      Unknown display mode
    {/if}
  {:catch ex}
    {ex.message ?? ex + ""}
  {/await}
</vbox>

<script lang="ts">
  import type { EMail } from "../../../logic/Mail/EMail";
  import { getLocalStorage } from "../../Util/LocalStorage";
  import HTMLDisplay from "./HTMLDisplay.svelte";
  import PlaintextDisplay from "./PlaintextDisplay.svelte";
  import ThreadDisplay from "./ThreadDisplay.svelte";
  import { showError } from "../../Util/error";

  export let message: EMail;

  let modeSetting = getLocalStorage("mail.contentRendering", "html");
  $: mode = $modeSetting.value as DisplayMode;

  function getSource(message: EMail): string {
    if (!message.mime) {
      return "Source not available";
    }
    return new TextDecoder().decode($message.mime);
  }
</script>

<script lang="ts" context="module">
  export enum DisplayMode {
    HTML = "html",
    HTMLWithExternal = "with-external",
    Plaintext = "plaintext",
    Source = "source",
    Thread = "thread",
  }
</script>
